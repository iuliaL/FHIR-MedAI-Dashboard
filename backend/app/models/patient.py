from datetime import datetime, timezone
from pymongo import MongoClient
from app.config import MONGO_URI
from pydantic import BaseModel
from enum import Enum
from fastapi import HTTPException


client = MongoClient(MONGO_URI)
db = client.medical_dashboard
patients_collection = db["patients"]


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"
    unknown = "unknown"


# MongoDB Patient Schema
class Patient(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    birth_date: str | None = None
    gender: Gender | None = None
    fhir_id: str
    email: str = None
    password: str
    is_admin: bool = False
    created_at: datetime = None
    updated_at: datetime = None


def store_patient(patient: Patient):
    """Stores the patient in MongoDB, ensuring gender validation."""
    # Convert Pydantic model to dictionary for MongoDB
    patient_dict = patient.model_dump(by_alias=True)

    # Add timestamps
    now = datetime.now(timezone.utc)
    patient_dict["created_at"] = now
    patient_dict["updated_at"] = now

    result = patients_collection.insert_one(patient_dict)

    # Check if the insert was acknowledged
    if not result.acknowledged:
        raise HTTPException(
            status_code=500, detail="Failed to insert patient into the database."
        )
    return patient


def update_patient(fhir_id: str, update_data: dict):
    """Updates patient information in MongoDB"""
    now = datetime.now(timezone.utc)
    update_data["updated_at"] = now

    result = patients_collection.update_one({"fhir_id": fhir_id}, {"$set": update_data})

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found in MongoDB")

    return True


def get_patients():
    """Retrieves patients from MongoDB"""
    return patients_collection.find()


def get_patient(fhir_id):
    """Retrieves patient from MongoDB by fhir_id"""
    return patients_collection.find_one({"fhir_id": fhir_id})


def search_patient(first_name, last_name):
    """Retrieves patient from MongoDB by first and lastname"""
    return patients_collection.find_one(
        {"first_name": first_name, "last_name": last_name}
    )


def search_patient_by_email(email: str):
    """Retrieves patient from MongoDB by email."""
    return patients_collection.find_one({"email": email})


def delete_patient(fhir_id):
    """Deletes a patient from MongoDB"""
    patients_collection.delete_one({"fhir_id": fhir_id})


def assign_admin(email: str):
    """Assigns admin role to a patient."""
    now = datetime.now(timezone.utc)
    patients_collection.update_one(
        {"email": email}, {"$set": {"is_admin": True, "updated_at": now}}
    )


def update_password(email: str, new_password: str):
    now = datetime.now(timezone.utc)
    patients_collection.update_one(
        {"email": email},
        {
            "$set": {"password": new_password, "updated_at": now},
            "$unset": {"reset_token": "", "reset_token_expires": ""},
        },
    )


def check_reset_token_expiration(token: str):
    patient = patients_collection.find_one(
        {
            "reset_token": token,
            "reset_token_expires": {"$gt": datetime.now(timezone.utc)},
        }
    )
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    return patient


def update_reset_token(email: str, reset_token: str, expires_at: datetime):
    now = datetime.now(timezone.utc)
    patients_collection.update_one(
        {"email": email},
        {
            "$set": {
                "reset_token": reset_token,
                "reset_token_expires": expires_at,
                "updated_at": now,
            }
        },
    )
