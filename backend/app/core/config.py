import os
import boto3
import json
from dotenv import load_dotenv

load_dotenv()

def get_secret(secret_name: str, region_name: str = "eu-west-1"):
    """
    Fetch secret from AWS Secrets Manager
    """
    client = boto3.client("secretsmanager", region_name=region_name)
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response["SecretString"])

class Settings:
    def __init__(self):
        # ====================
        # Database
        # ====================
        try:
            db_creds = get_secret("clockko-db-creds")
            self.DATABASE_URL = (
                f"postgresql://{db_creds['username']}:{db_creds['password']}@"
                f"{db_creds['host']}/{db_creds['dbname']}"
            )
        except Exception:
            # Fallback for local development
            self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clockko.db")

        # ====================
        # Security (JWT)
        # ====================
        try:
            jwt_secret = get_secret("clockko-jwt-secret")
            self.SECRET_KEY = jwt_secret["SECRET_KEY"]
        except Exception:
            self.SECRET_KEY = os.getenv("SECRET_KEY", "your-local-secret")

        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )

        # ====================
        # Email Configuration
        # ====================
        self.SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
        self.SMTP_USER = os.getenv("SMTP_USER", "")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        self.SMTP_FROM = os.getenv("SMTP_FROM", "")
        self.SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ClockKo Team")

        # ====================
        # Application
        # ====================
        self.APP_NAME = "ClockKo API"
        self.DEBUG = os.getenv("DEBUG", "False").lower() == "true"
        self.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

        # ====================
        # OTP Configuration
        # ====================
        self.OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
        self.OTP_LENGTH = 6


settings = Settings()
