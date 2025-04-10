from fastapi import HTTPException, Depends
from app.models.patient import search_patient_by_email, assign_admin
from fastapi import APIRouter
from pydantic import BaseModel
from app.utils.auth import admin_required, verify_password, create_access_token

router = APIRouter()

class LoginInput(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(credentials: LoginInput):
    # Search for patient by email
    user = search_patient_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify the password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT token
    token = create_access_token(data={
        "sub": user["email"],
        "role": "admin" if user.get("is_admin") else "patient"
    })
    return {"message": "Login successful", "token": token, "token_type": "Bearer", "fhir_id": user["fhir_id"]}


@router.get("/check-email")
async def check_patient_exists(email):
    """Check if a patient exists by email."""
    existing_patient = search_patient_by_email(email)
    if existing_patient:
        return {"message": "Patient exists. Please log in.", "exists": True}
    return {"message": "Patient not found. You can register now.", "exists": False}


@router.put("/assign-admin/{email}")
async def assign_admin_role(email: str, current_user: dict = Depends(admin_required)):
    assign_admin(email)
    return {"message": f"{email} is now an admin"}

