"""
Application configuration using Pydantic Settings.
All configuration is loaded from environment variables with sensible defaults.
"""

from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application Info
    APP_NAME: str = "Project Management System MVP"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # MongoDB Configuration
    MONGODB_URL: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection string",
    )
    MONGODB_DB_NAME: str = Field(
        default="project_gemini",
        description="MongoDB database name",
    )

    # Security & JWT
    SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT encoding (minimum 32 characters)",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Configuration
    CORS_ORIGINS: str | List[str] = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Allowed CORS origins (comma-separated in .env)",
    )
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: str | List[str] = "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    CORS_ALLOW_HEADERS: str | List[str] = "*"

    # File Upload Configuration
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes
    ALLOWED_EXTENSIONS: str | List[str] = "pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,txt,csv"

    # HRMSX Integration (Mock for MVP)
    HRMSX_API_URL: str = "https://mock.hrmsx.com/api"
    HRMSX_API_KEY: str = "mock-api-key"
    HRMSX_SYNC_ENABLED: bool = False

    # Email Configuration (Optional for MVP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@projectmanagement.com"
    SMTP_FROM_NAME: str = "Project Management System"
    SMTP_TLS: bool = True
    EMAIL_ENABLED: bool = False

    # Timezone & Localization
    TIMEZONE: str = "Asia/Karachi"
    DEFAULT_CURRENCY: str = "PKR"
    DEFAULT_HOURLY_RATE: float = 1000.00

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Rate Limiting (Optional)
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60

    @field_validator("CORS_ORIGINS", "CORS_ALLOW_METHODS", "ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_list_fields(cls, v: str | List[str]) -> List[str]:
        """Parse list fields from comma-separated string or list."""
        if isinstance(v, str):
            return [item.strip() for item in v.split(",")]
        return v


# Global settings instance
settings = Settings()
