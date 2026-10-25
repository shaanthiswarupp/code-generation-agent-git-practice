
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from git.exc import GitCommandError
from github import GithubException
from app.services.github_service import GitHubService

from app.services.change_service import ChangeService

router = APIRouter(prefix="/workflow", tags=["Code Change Workflow"])


class PrepareChangeRequest(BaseModel):
    file_path: str = Field(min_length=1, max_length=200)
    code: str = Field(min_length=1, max_length=100_000)
    branch_name: str = Field(min_length=1, max_length=100)
    approved: bool = False


class SubmitChangeRequest(BaseModel):
    file_path: str = Field(min_length=1, max_length=200)
    commit_message: str = Field(min_length=1, max_length=200)
    approved: bool = False

class PullRequestRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(default="", max_length=5000)
    head_branch: str = Field(min_length=1, max_length=100)
    base_branch: str = "main"
    approved: bool = False

@router.post("/pull-request")
def create_pull_request(request: PullRequestRequest):
    if not request.approved:
        raise HTTPException(
            status_code=400,
            detail="Human approval is required",
        )

    if request.base_branch in {"", request.head_branch}:
        raise HTTPException(
            status_code=400,
            detail="Invalid base branch",
        )

    try:
        github_service = GitHubService()

        return github_service.create_pull_request(
            title=request.title,
            body=request.body,
            head_branch=request.head_branch,
            base_branch=request.base_branch,
        )

    except GithubException as exc:
        raise HTTPException(
            status_code=502,
            detail="GitHub could not create the pull request",
        ) from exc




def get_change_service():
    repository_path = os.getenv("REPOSITORY_PATH")

    if not repository_path:
        raise HTTPException(
            status_code=500,
            detail="Repository path is not configured",
        )

    try:
        return ChangeService(repository_path)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.post("/prepare")
def prepare_change(request: PrepareChangeRequest):
    service = get_change_service()

    try:
        return service.prepare_new_python_file(
            relative_path=request.file_path,
            code=request.code,
            branch_name=request.branch_name,
            approved=request.approved,
        )
    except SyntaxError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Python syntax error on line {exc.lineno}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except GitCommandError as exc:
        raise HTTPException(
            status_code=400,
            detail="Git could not prepare the branch",
        ) from exc


@router.post("/submit")
def submit_change(request: SubmitChangeRequest):
    service = get_change_service()

    try:
        return service.commit_and_push(
            relative_path=request.file_path,
            commit_message=request.commit_message,
            approved=request.approved,
        )
    except (ValueError, GitCommandError) as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to commit or push the change",
        ) from exc
