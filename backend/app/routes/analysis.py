
import os
import re
from pydantic import BaseModel, Field
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/api/v1/analysis", tags=["Repository Analysis"])



class AnalysisRequest(BaseModel):
    repository_path: str = Field(min_length=1)
    requirement: str = Field(min_length=1)


def extract_keywords(requirement: str) -> list[str]:
    # Simple keyword extraction for the first version.
    words = re.findall(r"[a-zA-Z0-9_]+", requirement.lower())

    stop_words = {"the", "and", "for", "with", "from", "that","this", "into", "want", "need", "should",
                  "would", "could", "please", "create", "make","add", "implement", "using" }

    return list(dict.fromkeys(
        word for word in words
        if len(word) > 2 and word not in stop_words
    ))


@router.post("/request")
def analyze_requirement(request: AnalysisRequest):
    repository_path = request.repository_path.strip()
    requirement = request.requirement.strip()

    if not repository_path or not requirement:
        raise HTTPException(status_code=400,detail="Repository path and requirement are required.",)

    path = Path(repository_path).expanduser()

    if not path.is_dir():
        raise HTTPException(status_code=400,detail="The repository path does not exist on the backend machine.",)

    try:
        keywords = extract_keywords(requirement)
        service = AnalysisService(str(path))
        report = service.analyze_repository(keywords)

        return {"repository_path": str(path),"requirement": requirement,"keywords": keywords,"report": report,}

    except ValueError as exc:
        raise HTTPException(status_code=400,detail=str(exc),) from exc






@router.get("/repository")
def analyze_repository(keywords: str = Query(default="",description="Comma-separated keywords, such as jobs,database,router",) ):
    repository_path = os.getenv("REPOSITORY_PATH")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL")

    if not repository_path:
        raise HTTPException(status_code=500,detail="Repository path is not configured",)

    keyword_list = [
                        item.strip()
                        for item in keywords.split(",")
                        if item.strip()
                    ]

    try:
        service = AnalysisService(repository_path)
        return service.analyze_repository(keyword_list)

    except ValueError as exc:
        raise HTTPException(status_code=400,detail=str(exc), ) from exc

