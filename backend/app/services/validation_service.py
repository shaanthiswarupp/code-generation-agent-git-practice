
import ast
import json
import os
import subprocess
from pathlib import Path


MAX_CODE_LENGTH = 100_000


class ValidationService:

    def validate_python(self, code: str):
        errors = []
        checks = []

        # Check 1: Is code provided?
        if not code or not code.strip():
            return {
                "valid": False,
                "checks": [],
                "errors": ["Generated code is empty"],
            }

        # Check 2: Prevent excessively large input.
        if len(code) > MAX_CODE_LENGTH:
            return {
                "valid": False,
                "checks": [],
                "errors": ["Code exceeds the allowed size limit"],
            }

        # Check 3: Parse Python syntax without executing the code.
        try:
            ast.parse(code) 
            checks.append({
                "name": "python_syntax",
                "passed": True,
                "message": "Python syntax is valid",
            })

        except SyntaxError as exc:
            errors.append(f"Line {exc.lineno}: {exc.msg}")
            
            checks.append({
                "name": "python_syntax",
                "passed": False,
                "message": "Python syntax contains an error",
            })

        return {
            "valid": len(errors) == 0,
            "checks": checks,
            "errors": errors,
        }
    
    
    def validate_frontend(self, code: str, target_file: str):
        
        if not code or not code.strip():
            return {"valid": False,"errors": ["Generated code is empty"],}

        if len(code) > MAX_CODE_LENGTH:
            return {"valid": False,"errors": ["Code exceeds the allowed size limit"],}

        extension = Path(target_file).suffix.lower()

        allowed_extensions = {".js", ".jsx", ".ts", ".tsx"}
        if extension not in allowed_extensions:
            return {"valid": False,"errors": ["Only JavaScript, JSX, TypeScript, and TSX files are supported"],}

        repository_path = os.getenv("REPOSITORY_PATH")
        if not repository_path:
            return {"valid": False,"errors": ["Repository path is not configured"],}

        frontend_dir = Path(repository_path).resolve() / "frontend"

        parser_script = frontend_dir / "scripts" / "validate-jsx.mjs"

        if not parser_script.is_file():
            return {"valid": False,"errors": ["Frontend parser script was not found"],}

        try:
            result = subprocess.run(
                ["node", str(parser_script), extension],
                input=code,
                capture_output=True,
                text=True,
                timeout=10,
                cwd=str(frontend_dir),
                check=False,
            )
            response = json.loads(result.stdout)

            if result.returncode not in (0, 1):
                return {"valid": False,"errors": ["Parser could not validate the code"],}

            return response

        except subprocess.TimeoutExpired:
            return {"valid": False,"errors": ["Code validation timed out"],}
        except FileNotFoundError:
            return {"valid": False,"errors": ["Node.js could not be found. Check your Node.js installation."],}
        except json.JSONDecodeError:
            return {"valid": False,"errors": ["Could not read the parser response"],}
