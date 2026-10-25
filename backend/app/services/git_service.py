from pathlib import Path

from git import Repo


class GitService:

    def __init__(self, repository_path: str):
        self.repository_path = Path(repository_path)

        if not (self.repository_path / ".git").exists():
            raise ValueError(
                "The specified path is not a Git repository"
            )

        self.repo = Repo(self.repository_path)

    def get_status(self):
        return {
            "branch": self.repo.active_branch.name,
            "changed_files": [
                item.a_path
                for item in self.repo.index.diff(None)
            ],
            "untracked_files": self.repo.untracked_files
        }

    def create_branch(self, branch_name: str):
        if branch_name in [
            branch.name for branch in self.repo.branches
        ]:
            raise ValueError("Branch already exists")

        new_branch = self.repo.create_head(branch_name)
        new_branch.checkout()

        return new_branch.name