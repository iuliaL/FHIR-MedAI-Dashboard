from fastapi import APIRouter
from .lab_results import router as lab_results_router
from .patients import router as patients_router
from .auth import router as auth_router
from app.config import MONGO_URI
from pymongo import MongoClient


router = APIRouter()

@router.get("/", include_in_schema=False)
def home():
    return {"message": "LabsExplained API Running"}

@router.get("/health", include_in_schema=False)
@router.head("/health", include_in_schema=False)
def health_check():
    return {"status": "ok"}


@router.get("/test-db", include_in_schema=False)
def test_db_connection():
    try:
        client = MongoClient(MONGO_URI)
        db_names = client.list_database_names()
        return {"status": "success", "databases": db_names}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(patients_router, tags=["Patients"])
router.include_router(lab_results_router, tags=["Lab Results"])
