import os

from app.main import parse_cors_origins, find_invalid_origins


def test_parse_empty():
    assert parse_cors_origins("") == []


def test_parse_single():
    assert parse_cors_origins("https://example.com") == ["https://example.com"]


def test_parse_multiple_and_trim():
    raw = " https://a.com , http://localhost:5173 ,  ,https://b.org"
    assert parse_cors_origins(raw) == ["https://a.com", "http://localhost:5173", "https://b.org"]


def test_find_invalid():
    origins = ["https://good.com", "localhost", "bad-origin", "http://localhost:5173"]
    invalid = find_invalid_origins(origins)
    assert "bad-origin" in invalid
    assert "localhost" not in invalid
    assert "https://good.com" not in invalid


def test_find_invalid_all_bad():
    origins = ["", "no-scheme", "also.bad"]
    assert find_invalid_origins(origins) == ["", "no-scheme", "also.bad"]

