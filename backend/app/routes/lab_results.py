from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from datetime import datetime
import re
from app.services.fhir import send_lab_results_to_fhir, remove_all_observations_for_patient, remove_fhir_observation, get_fhir_observations
from app.utils.file_parser import extract_text
from app.services.openai import extract_lab_results_with_gpt, interpret_full_lab_set
from app.models.lab_test_set import get_lab_test_sets_for_patient, remove_lab_test_set, store_lab_test_set, get_lab_test_set_by_id, update_lab_test_set


router = APIRouter()

@router.get("/lab_set/{patient_fhir_id}")
async def get_all_patient_lab_sets(patient_fhir_id: str, include_observations: bool = False):
    """
    Retrieves all lab test sets for a specific patient.
    
    If `include_observations=True`, fetches full observation details from FHIR.
    """
    lab_test_sets = get_lab_test_sets_for_patient(patient_fhir_id)

    if include_observations:
        for test_set in lab_test_sets:
            test_set["observations"] = get_fhir_observations(test_set["observation_ids"])

    return {"lab_test_sets": lab_test_sets}


@router.post("/lab_set")
async def upload_patient_lab_test_set(
    file: UploadFile = File(...),
    date: str = Form(...),
    patient_fhir_id: str = Form(...)
    ):
    """
    Upload a PDF or image containing lab test results, extract text using OCR, 
    and store structured lab data as FHIR Observations linked to a specific patient.
    """

    if not patient_fhir_id:
        raise HTTPException(status_code=400, detail="Patient FHIR ID is required.")

    # If date is missing or empty, use today's date
    if not date or date.strip() == "":
        date = datetime.today().strftime('%Y-%m-%d')

    # Validate the date format (YYYY-MM-DD)
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    try:
        contents = await file.read()
        extracted_text = extract_text(file.filename, contents)
        print("Extracted OCR text:", extracted_text)

        # Use GPT-4 to extract structured lab results
        structured_results = extract_lab_results_with_gpt(extracted_text)
        # Parse extracted text into structured lab results
        print("JSON structured lab tests", structured_results)

        # Send structured lab results to FHIR
        observations = send_lab_results_to_fhir(structured_results, patient_fhir_id, date)
        
        # Store only observation IDs in MongoDB
        observation_ids = [obs["id"] for obs in observations if "id" in obs]
        lab_test_set = store_lab_test_set(patient_fhir_id, date, observation_ids)
   
        response_data = {
            "message": "Lab results processed successfully.",
            "lab_test_set": lab_test_set
        }
        return response_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/lab_set/{lab_test_set_id}")
async def delete_lab_test_set(lab_test_set_id: str):
    """
    Deletes a specific lab test set and removes its observations from the FHIR server.

    Args:
        lab_test_set_id (str): The MongoDB ID of the lab test set.

    Returns:
        dict: Deletion result.
    """
    # Retrieve lab test set details to get the observation IDs
    lab_test_set = get_lab_test_set_by_id(lab_test_set_id)

    if not lab_test_set:
        raise HTTPException(status_code=404, detail="Lab test set not found.")

    # Extract FHIR observation IDs from the lab test set
    observation_ids = lab_test_set.get("observation_ids", [])

    # Delete observations from FHIR server
    deleted_observations = []
    failed_observations = []

    for obs_id in observation_ids:
        delete_result = remove_fhir_observation(obs_id)
        if "message" in delete_result:
            deleted_observations.append(obs_id)
        else:
            failed_observations.append(delete_result)

    # Now delete the lab test set from MongoDB
    result = remove_lab_test_set(lab_test_set_id)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "message": f"Lab test set {lab_test_set_id} deleted successfully.",
        "deleted_observations": deleted_observations,
        "failed_observations": failed_observations
    }


    
@router.delete("/observations/{observation_id}")
async def delete_observation(observation_id: str):
    """Deletes a specific Observation by its ID."""
    result = remove_fhir_observation(observation_id)
    return result


@router.delete("/observations/patient/{patient_fhir_id}")
async def delete_all_observations_for_patient(patient_fhir_id: str):
    """Deletes all Observations linked to a specific patient."""
    result = remove_all_observations_for_patient(patient_fhir_id)
    return result




@router.post("/lab_set/{lab_test_set_id}/interpret")
def interpret_lab_test_set(lab_test_set_id: str):
    """
    Generates an AI-based interpretation for the entire lab test set.

    Args:
        lab_test_set_id (str): The MongoDB ID of the lab test set.

    Returns:
        dict: Updated lab test set with AI interpretation.
    """
    # ✅ Retrieve the full lab test set
    lab_test_set = get_lab_test_set_by_id(lab_test_set_id)

    if not lab_test_set:
        raise HTTPException(status_code=404, detail="Lab test set not found.")
    
    # ✅ Retrieve birth date & gender from lab test set
    birth_date = lab_test_set.get("birth_date", "Unknown")
    gender = lab_test_set.get("gender", "Unknown")

    # ✅ Fetch full lab set results from FHIR using the stored observation IDs
    observation_ids = lab_test_set.get("observation_ids", [])
    full_lab_tests = get_fhir_observations(observation_ids)  # ✅ Now we have real test results

    if not full_lab_tests:
        raise HTTPException(status_code=400, detail="No lab test results found in FHIR.")

    # ✅ Generate AI-based summary using OpenAI
    interpretation = interpret_full_lab_set(full_lab_tests, birth_date, gender)

    # ✅ Store the interpretation in MongoDB
    lab_test_set["interpretation"] = interpretation
    update_lab_test_set(lab_test_set_id, {"interpretation": interpretation})

    return {
        "message": f"Interpretation added to lab test set {lab_test_set_id}",
        "interpretation": interpretation
    }
    

    
