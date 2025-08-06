import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clockko.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "ClockKo Team")
    
    # Application
    APP_NAME: str = "ClockKo API"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # OTP Configuration
    OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
    OTP_LENGTH: int = 6


settings = Settings()
