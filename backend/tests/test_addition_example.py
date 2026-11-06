
from backend.test_workspace.generated_test import add_numbers


def test_add_numbers_positive():
    assert add_numbers(2, 3) == 5


def test_add_numbers_negative():
    assert add_numbers(-2, -3) == -5


def test_add_numbers_zero():
    assert add_numbers(5, 0) == 5
