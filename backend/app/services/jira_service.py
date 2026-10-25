import os

from dotenv import load_dotenv
from jira import JIRA 


load_dotenv()


class JiraService:
    #======================== initialize JiraService ==========================
    def __init__(self):
        self.jira_url = os.getenv("JIRA_URL")
        self.jira_email = os.getenv("JIRA_EMAIL")
        self.jira_api_token = os.getenv("JIRA_API_TOKEN")
        self.project_key = os.getenv("JIRA_PROJECT_KEY")

        self.client = None

    #======================== connect to Jira ==========================
    def connect(self):
        self.client = JIRA( server=self.jira_url, basic_auth=(self.jira_email,self.jira_api_token) )

        return self.client


    
    #======================== get epics for a specific project ==========================
    def get_epics(self, project_key: str):
        if self.client is None:
            self.connect()

        target_project = project_key or self.project_key

        jql = ( f'project = "{target_project}" '
                f'AND issuetype = "Epic" '
                f'ORDER BY created DESC'   ) # ASC Or DESC

        issues = self.client.search_issues( jql, maxResults=50 )
        return issues


    
    #======================== get issues for a specific epic ==========================
    def get_issues_for_epic(self, epic_key: str):
        if self.client is None:
            self.connect()

        jql = ( f'"Epic Link" = "{epic_key}" '
                f'ORDER BY created DESC'   )

        issues = self.client.search_issues( jql, maxResults=50 )
        return issues