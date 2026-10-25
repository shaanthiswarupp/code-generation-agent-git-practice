from app.services.jira_service import JiraService

jira_service = JiraService()

jira = jira_service.connect()

print("Connected to Jira!")

# print(jira.myself())

projects   =  jira.projects()
epics     =     jira_service.get_epics(jira_service.project_key)
# epics = jira_service.get_epics("PK")

for project in projects:
   print(project.key,project.name )

for epic in epics:
    print(epic.key,epic.fields.summary)
