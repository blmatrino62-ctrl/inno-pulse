from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Real URL comes from backend/.env (local dev) or the DATABASE_URL
    # env var set in docker-compose — never commit credentials here.
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    environment: str = "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
