
import ast
from pathlib import Path


IGNORED_DIRS = {
    ".git",
    "venv",
    ".venv",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    "dist",
    "build",
}

IGNORED_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    "id_rsa",
    "id_ed25519",
}

SUPPORTED_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".sql",
    ".json",
    ".md",
    ".yaml",
    ".yml",
}

MAX_FILES = 500
MAX_FILE_BYTES = 200_000


class AnalysisService:
    def __init__(self, repository_path: str):
        self.root = Path(repository_path).resolve()

        if not self.root.is_dir():
            raise ValueError("Repository directory does not exist")

        if not (self.root / ".git").exists():
            raise ValueError("Directory is not a Git repository")

    def analyze_repository(self, keywords=None):
        keywords = keywords or []
        files = []
        matches = []
        python_structure = []

        for path in self.root.rglob("*"):
            # Ignore directories such as .git and node_modules.
            if any(part in IGNORED_DIRS for part in path.parts):
                continue

            if not path.is_file():
                continue

            # Never inspect environment files or private keys.
            if path.name.lower() in IGNORED_FILES:
                continue

            if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                continue

            # Prevent unexpectedly large scans.
            if len(files) >= MAX_FILES:
                break

            try:
                # Do not follow files outside the repository.
                resolved_path = path.resolve()
                resolved_path.relative_to(self.root)

                # Skip files that are too large.
                if path.stat().st_size > MAX_FILE_BYTES:
                    continue

                content = path.read_text(
                    encoding="utf-8",
                    errors="replace",
                )
            except (OSError, ValueError):
                continue

            relative_path = path.relative_to(self.root).as_posix()

            files.append({
                "path": relative_path,
                "extension": path.suffix.lower(),
                "size_bytes": path.stat().st_size,
            })

            # Find files containing task-related keywords.
            content_lower = content.lower()

            for keyword in keywords:
                keyword = keyword.strip().lower()

                if keyword and keyword in content_lower:
                    matches.append({
                        "path": relative_path,
                        "keyword": keyword,
                    })

            # Extract basic structure from Python files.
            if path.suffix.lower() == ".py":
                try:
                    tree = ast.parse(content)
                    imports = []
                    functions = []
                    classes = []

                    for node in ast.walk(tree):
                        if isinstance(node, ast.Import):
                            imports.extend(
                                item.name for item in node.names
                            )

                        elif isinstance(node, ast.ImportFrom):
                            imports.append(node.module or "")

                        elif isinstance(
                            node, (ast.FunctionDef, ast.AsyncFunctionDef)
                        ):
                            functions.append(node.name)

                        elif isinstance(node, ast.ClassDef):
                            classes.append(node.name)

                    python_structure.append({
                        "path": relative_path,
                        "imports": sorted(set(imports)),
                        "functions": sorted(set(functions)),
                        "classes": sorted(set(classes)),
                    })

                except SyntaxError:
                    # Report the file, even if its syntax is invalid.
                    python_structure.append({
                        "path": relative_path,
                        "imports": [],
                        "functions": [],
                        "classes": [],
                        "parse_error": True,
                    })

        return {
            "repository": self.root.name,
            "total_files": len(files),
            "files": files,
            "keyword_matches": matches,
            "python_structure": python_structure,
        }
