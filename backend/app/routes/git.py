import re

from fastapi import APIRouter, HTTPException

from app.services.git_service import GitService


router = APIRouter(prefix="/git", tags=["Git"])


def get_git_service():
    import os

    repository_path = os.getenv("REPOSITORY_PATH")

    if not repository_path:
        raise HTTPException(
            status_code=500,
            detail="Repository path is not configured"
        )

    try:
        return GitService(repository_path)
    except (ValueError, Exception) as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to open configured repository"
        ) from exc


@router.get("/status")
def get_repository_status():
    service = get_git_service()
    return service.get_status()


@router.post("/branches")
def create_repository_branch(branch_name: str):
    if not re.fullmatch(
        r"[A-Za-z0-9][A-Za-z0-9._/-]{0,99}",
        branch_name
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid branch name"
        )

    service = get_git_service()

    try:
        created_branch = service.create_branch(branch_name)
        return {
            "message": "Branch created",
            "branch": created_branch
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        ) from exc