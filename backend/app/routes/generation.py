
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from openai import OpenAIError
from pydantic import BaseModel, Field

from app.services.generation_service import GenerationService


router = APIRouter(prefix="/api/v1/generation",tags=["Code Generation"],)

ALLOWED_EXTENSIONS = {".py", ".js", ".jsx", ".ts", ".tsx"}


class GenerationRequest(BaseModel):
    requirement: str = Field(min_length=10, max_length=5000)


class ApplyCodeRequest(BaseModel):
    target_file: str = Field(min_length=1, max_length=500)
    code: str = Field(min_length=1, max_length=100000)
    approved: bool = False


class RollbackRequest(BaseModel):
    target_file: str = Field(min_length=1, max_length=500)
    backup_file: str = Field(min_length=1, max_length=1000)
    approved: bool = False


def get_repository_root():
    repository_path = os.getenv("REPOSITORY_PATH")

    if not repository_path:
        raise HTTPException(status_code=500,detail="Repository path is not configured.",)
    return Path(repository_path).resolve()


def get_safe_target(root: Path, target_file: str) -> Path:
    try:
        target = (root / target_file).resolve()
        target.relative_to(root)
    except (ValueError, OSError):
        raise HTTPException(status_code=400,detail="Target file must be inside the repository.",)

    if target.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400,detail="This file type is not allowed.",)
    return target


@router.post("/request")
def request_code_generation(request: GenerationRequest):
    repository_path = os.getenv("REPOSITORY_PATH")

    if not repository_path:
        raise HTTPException(status_code=500,detail="Repository path is not configured.",)
    
    try:
        service = GenerationService()
        return service.generate_code(requirement=request.requirement,repository_path=repository_path,)

    except ValueError as exc:
        raise HTTPException(status_code=400,detail=str(exc),) from exc
    
    except OpenAIError as exc:
        print(f"[DEBUG] OpenAI Error Class: {type(exc).__name__}")
        print(f"[DEBUG] OpenAI Error Details: {exc}")

        raise HTTPException(status_code=502,detail="The AI provider request failed.",) from exc




@router.post("/apply")
def apply_generated_code(request: ApplyCodeRequest):
    if not request.approved:
        raise HTTPException(status_code=400,detail="Explicit approval is required.",)

    root = get_repository_root()
    target = get_safe_target(root, request.target_file)

    if not target.is_file():
        raise HTTPException(status_code=404,detail="Target file does not exist.",)

    backup_root = root / ".ai_backups"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")

    # Keep the original folder structure and create a unique backup.
    backup_file = (backup_root/ request.target_file).with_name(f"{target.name}.{timestamp}.bak")

    try:
        backup_file.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, backup_file)

        target.write_text(request.code, encoding="utf-8")

        return {
            "status": "applied",
            "target_file": request.target_file,
            "backup_file": backup_file.relative_to(root).as_posix(),
        }

    except OSError as exc:
        raise HTTPException(status_code=500, detail="Could not back up or update the target file.",) from exc


@router.post("/rollback")
def rollback_generated_code(request: RollbackRequest):
    if not request.approved:
        raise HTTPException(status_code=400,detail="Explicit approval is required for rollback.",)

    root = get_repository_root()
    target = get_safe_target(root, request.target_file)
    backup_root = (root / ".ai_backups").resolve()

    try:
        backup = (root / request.backup_file).resolve()

        # A backup must be inside the dedicated backup directory.
        backup.relative_to(backup_root)

        # Only restore a backup belonging to this exact target file.
        expected_parent = (backup_root / Path(request.target_file).parent).resolve()

        if backup.parent != expected_parent:
            raise HTTPException(status_code=400,detail="Backup does not belong to the requested target file.",)

        expected_prefix = Path(request.target_file).name + "."

        if not backup.name.startswith(expected_prefix) or not backup.name.endswith(".bak"):
            raise HTTPException(status_code=400,detail="Invalid backup filename.",)

    except ValueError as exc:
        raise HTTPException(status_code=400,detail="Backup must be inside the permitted backup directory.",) from exc



    if not target.is_file():
        raise HTTPException(status_code=404,detail="Target file does not exist.",)

    if not backup.is_file():
        raise HTTPException(status_code=404,detail="Backup file does not exist.",)

    try:
        # Preserve the current version before restoring the old one.
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        recovery_backup = backup.with_name(f"{backup.name}.{timestamp}.before-rollback")
        shutil.copy2(target, recovery_backup)

        # Restore the selected backup.
        shutil.copy2(backup, target)

        return {
            "status": "rolled_back",
            "target_file": request.target_file,
            "restored_from": request.backup_file,
            "recovery_backup": recovery_backup.relative_to(root).as_posix(),
        }

    except OSError as exc:
        raise HTTPException(status_code=500,detail="Could not restore the backup.",) from exc






# import os
# from fastapi import APIRouter, HTTPException
# from openai import OpenAIError
# from pydantic import BaseModel, Field
# from pathlib import Path
# import shutil

# from app.services.generation_service import GenerationService

# router = APIRouter(prefix="/api/v1/generation", tags=["Code Generation"])


# class GenerationRequest(BaseModel):
#     requirement: str = Field(min_length=10, max_length=5000)

# class ApplyCodeRequest(BaseModel):
#     target_file: str = Field(min_length=1, max_length=500)
#     code: str = Field(min_length=1, max_length=100000)
#     approved: bool = False




# @router.post("/request")
# def request_code_generation(request: GenerationRequest):
#     repository_path = os.getenv("REPOSITORY_PATH")

#     if not repository_path:
#         raise HTTPException(status_code=500,detail="Repository path is not configured",)

#     try:
#         service = GenerationService()
#         return service.generate_code(requirement=request.requirement,repository_path=repository_path,)

#     except ValueError as exc:
#         raise HTTPException(status_code=400,detail=str(exc),) from exc
  
#     except OpenAIError as exc:
#         print(f"\n[DEBUG] OpenAI Error Class: {type(exc).__name__}")
#         print(f"[DEBUG] OpenAI Error Details: {exc}\n")
#         raise HTTPException(status_code=502,detail="The AI provider request failed",) from exc



# # for apply end point

# @router.post("/apply")
# def apply_generated_code(request: ApplyCodeRequest):
#     if not request.approved:
#         raise HTTPException(status_code=400,detail="Explicit approval is required.",)

#     repository_path = os.getenv("REPOSITORY_PATH")
#     if not repository_path:
#         raise HTTPException(status_code=500,detail="Repository path is not configured.",)

#     try:
#         root = Path(repository_path).resolve()
#         target = (root / request.target_file).resolve()

#         # Prevent paths outside the configured repository.
#         target.relative_to(root)

#         # Only update an existing source file.
#         if not target.is_file():
#             raise HTTPException(status_code=404,detail="Target file does not exist.",)

#         if target.suffix.lower() not in {".py", ".js", ".jsx", ".ts", ".tsx"}:
#             raise HTTPException(status_code=400,detail="This file type is not allowed.",)

#         # Preserve the original file before changing it.
#         backup_root = root / ".ai_backups"
#         backup_file = backup_root / request.target_file
#         backup_file.parent.mkdir(parents=True, exist_ok=True)
#         shutil.copy2(target, backup_file)

#         target.write_text(request.code, encoding="utf-8")

#         return {
#             "status": "applied",
#             "target_file": request.target_file,
#             "backup_file": str(backup_file.relative_to(root)),
#         }

#     except ValueError as exc:
#         raise HTTPException(status_code=400,detail="Target file must be inside the repository.",) from exc
#     except OSError as exc:
#         raise HTTPException(status_code=500,detail="Could not back up or update the target file.",) from exc
