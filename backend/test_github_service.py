from app.services.github_service import GitHubService


github_service = GitHubService()

result = github_service.create_pull_request(
    title="Add jobs API-2 practice examples",
    body="Practice PR created using Python.",
    head_branch="feature/get-jobs-api-2",
    base_branch="main"
)

print(result)