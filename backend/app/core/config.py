import json
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoSphere ESG Platform"
    DATABASE_URL: str = "sqlite:///./ecosphere.db"
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    BACKEND_CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:5174","http://localhost:3000"]'

    @property
    def cors_origins(self):
        try:
            return json.loads(self.BACKEND_CORS_ORIGINS)
        except Exception:
            return ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
