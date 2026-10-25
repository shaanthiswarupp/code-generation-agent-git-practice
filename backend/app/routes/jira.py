from fastapi import APIRouter, HTTPException

from app.services.jira_service import JiraService


router = APIRouter(prefix="/api/v1/jira", tags=["Jira"] )


jira_service = JiraService()

# post jira credentials
@router.post("/configure")
def configure_jira():
    return {"message": "Jira configuration endpoint is working"}


#GET /jira/epics?project_key=CGA
@router.get("/epics")# later add query parameter for project_key through request body, or path parameter jiradata:jiracreate
def get_epics(project_key = jira_service.project_key):

    try:
        epics = jira_service.get_epics(project_key)
        #return [ {"key": epic.key, "summary": epic.fields.summary, "description": epic.fields.description}for epic in epics]
        #return epic_keys = [ {epic.fields.summary , epic.key } for epic in epics]
        epics_list = []

        for epic in epics:
            epic_data = {"key": epic.key,"summary": epic.fields.summary,"description": epic.fields.description }
            epics_list.append(epic_data)

        return epics_list  # Return the raw response from Jira API
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Jira epics: {str(e)}")
