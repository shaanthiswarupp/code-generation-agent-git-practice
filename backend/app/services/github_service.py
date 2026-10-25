import os

from dotenv import load_dotenv
from github import Github


load_dotenv()


class GitHubService:

    def __init__(self):
        token = os.getenv("GITHUB_TOKEN")
        repository_name = os.getenv("GITHUB_REPOSITORY")

        if not token or not repository_name:
            raise ValueError(
                "GitHub configuration is missing"
            )

        github = Github(token)
        self.repo = github.get_repo(repository_name)




    def create_pull_request(self,title: str,body: str,head_branch: str,base_branch: str= "main"):
        pull_request = self.repo.create_pull(title=title,body=body,head=head_branch,base=base_branch)

        return {"number": pull_request.number,"title": pull_request.title,
                "url": pull_request.html_url,"state": pull_request.state}