
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.validation_service import ValidationService

router = APIRouter( prefix="/api/v1/validation", tags=["Code Validation"],)


class ValidationRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)

class FrontendValidationRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)
    target_file: str = Field(min_length=1, max_length=500)



@router.post("/python")
def validate_python_code(request: ValidationRequest):
    service = ValidationService()
    return service.validate_python(request.code)



@router.post("/frontend")
def validate_frontend_code(request: FrontendValidationRequest):
    service = ValidationService()
    return service.validate_frontend(
        code=request.code,
        target_file=request.target_file,
    )