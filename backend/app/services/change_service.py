
import ast
import re
from pathlib import Path

from git import Repo


PROTECTED_NAMES = {".env",".gitignore","requirements.txt",}


class ChangeService:

    def __init__(self, repository_path: str):
        self.root = Path(repository_path).resolve()

        if not self.root.is_dir():
            raise ValueError("Repository directory does not exist")

        if not (self.root / ".git").exists():
            raise ValueError("Directory is not a Git repository")

        self.repo = Repo(self.root)

    #============================ prepare_new_python_file ============================
    def prepare_new_python_file(self,relative_path: str,code: str,branch_name: str,approved: bool,):
        if not approved:
            raise ValueError("Human approval is required")

        if not code.strip():
            raise ValueError("Generated code is empty")

        # Check Python syntax before writing anything.
        ast.parse(code)

        # Restrict this learning version to Python files.
        relative = Path(relative_path)

        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError("Invalid file path")

        if relative.suffix.lower() != ".py":
            raise ValueError("Only new Python files are supported")

        if relative.name.lower() in PROTECTED_NAMES:
            raise ValueError("This file cannot be created by this service")

        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,99}", branch_name,):
            raise ValueError("Invalid branch name")

        if self.repo.is_dirty(untracked_files=True):
            raise ValueError("Repository has uncommitted changes. ""Commit or back up your work first."
            )

        if branch_name in self.repo.heads:
            raise ValueError("Branch already exists")
        

        try:
            self.repo.git.check_ref_format("--branch", branch_name)
        except Exception as exc:
            raise ValueError("Invalid Git branch name") from exc

        target = (self.root / relative).resolve()


        try:
            target.relative_to(self.root)
        except ValueError as exc:
            raise ValueError("File path escapes the repository") from exc

        if target.exists():
            raise ValueError(
                "File already exists. This version does not overwrite files."
            )

        # Create and switch to a separate branch.
        original_branch = self.repo.active_branch.name
        branch = self.repo.create_head(branch_name)
        branch.checkout()

        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            # Re-check after creating the parent directory.
            target.resolve().relative_to(self.root)
            # Exclusive creation prevents overwriting an existing file.
            with target.open("x", encoding="utf-8", newline="\n") as file:
                file.write(code)
                if not code.endswith("\n"):
                    file.write("\n")

        # except Exception:
        #     # Remove the newly created branch if writing fails.
        #     if target.exists():
        #         target.unlink()
        #     self.repo.heads[branch_name].checkout() if False else None
        #     raise
        except Exception:
            if target.exists() and target.is_file():
                target.unlink()

            self.repo.git.checkout(original_branch)
            self.repo.delete_head(branch_name, force=True)
            raise

        return {
            "branch": branch_name,
            "file": target.relative_to(self.root).as_posix(),
            "message": "New file prepared for review; not committed yet",
        }


    
    #============================ commit_and_push ============================
    def commit_and_push(self,relative_path: str,commit_message: str,approved: bool,):
        if not approved:
            raise ValueError("Human approval is required")

        if not commit_message.strip():
            raise ValueError("Commit message is required")

        if self.repo.head.is_detached:
            raise ValueError("Repository is in detached HEAD state")

        branch_name = self.repo.active_branch.name

        if branch_name in {"main", "master"}:
            raise ValueError("Refusing to commit directly to the main branch")

        relative = Path(relative_path)

        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError("Invalid file path")

        target = (self.root / relative).resolve()

        try:
            target.relative_to(self.root)
        except ValueError as exc:
            raise ValueError("File path escapes the repository") from exc

        if not target.is_file() or target.suffix.lower() != ".py":
            raise ValueError("Expected a Python file inside the repository")

        # Stage only the intended file.
        self.repo.index.add([target.relative_to(self.root).as_posix()])

        if not self.repo.index.diff("HEAD"):
            raise ValueError("No staged changes to commit")

        commit = self.repo.index.commit(commit_message)

        origin = self.repo.remote(name="origin")
        origin.push(branch_name)

        return {
            "branch": branch_name,
            "commit": commit.hexsha,
            "message": "Changes committed and pushed",
        }
