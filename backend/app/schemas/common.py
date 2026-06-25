from typing import Any, Generic, TypeVar

from pydantic import BaseModel, model_validator


def _fix(s: str) -> str:
    """Reverse CP437 mojibake: DB stored UTF-8 bytes in a CP437 database."""
    try:
        return s.encode("cp437").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


class FixedModel(BaseModel):
    """Base model that auto-fixes CP437→UTF-8 mojibake on all string fields."""

    @model_validator(mode="before")
    @classmethod
    def fix_encoding(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        out: dict[str, Any] = {}
        for k, v in data.items():
            if isinstance(v, str):
                out[k] = _fix(v)
            elif isinstance(v, list):
                out[k] = [_fix(i) if isinstance(i, str) else i for i in v]
            else:
                out[k] = v
        return out


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
