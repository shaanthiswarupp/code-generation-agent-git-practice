
from app.services.validation_service import ValidationService

validator = ValidationService()

good_code = """
                def get_jobs():
                    return []
                """

bad_code = """
                def get_jobs()
                    return []
                """

print("Testing valid code:")
print(validator.validate_python(good_code))

print("\nTesting invalid code:")
print(validator.validate_python(bad_code))
