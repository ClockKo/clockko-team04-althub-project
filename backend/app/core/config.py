import os
import boto3
import json
from dotenv import load_dotenv

def get_secret(secret_name: str, region_name: str | None = None):
    """
    Fetch secret from AWS Secrets Manager. Region is resolved from AWS_REGION env
    if not explicitly provided.
    """
    region = region_name or os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    # The secret can be a JSON string or plain text. Try JSON first.
    try:
        return json.loads(response.get("SecretString", "{}"))
    except json.JSONDecodeError:
        return {"value": response.get("SecretString", "")}

class Settings:
    def __init__(self):
        # Load environment variables first
        load_dotenv()
        
        # ====================
        # Database
        # ====================
        # Prefer direct DATABASE_URL if provided (e.g., injected from Secrets Manager by ECS)
        db_url_secret_name = os.getenv("DB_URL_SECRET_NAME", "")
        db_creds_secret_name = os.getenv("DB_CREDS_SECRET_NAME", "")

        self.DATABASE_URL = os.getenv("DATABASE_URL", "")
        if not self.DATABASE_URL and db_url_secret_name:
            # Try a secret that stores the full URL
            try:
                db_url_secret = get_secret(db_url_secret_name)
                # Support either {"value": "postgresql://..."} or raw string under key DATABASE_URL
                self.DATABASE_URL = (
                    db_url_secret.get("DATABASE_URL")
                    or db_url_secret.get("value")
                    or ""
                )
            except Exception:
                self.DATABASE_URL = ""

        if not self.DATABASE_URL and db_creds_secret_name:
            # Build URL from discrete creds stored in a secret
            try:
                db_creds = get_secret(db_creds_secret_name)
                self.DATABASE_URL = (
                    f"postgresql://{db_creds['username']}:{db_creds['password']}@"
                    f"{db_creds['host']}/{db_creds.get('dbname') or db_creds.get('db_name') or 'postgres'}"
                )
            except Exception:
                self.DATABASE_URL = ""

        if not self.DATABASE_URL:
            # Fallback for local development
            self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clockko.db")

        # ====================
        # Security (JWT)
        # ====================
        # Prefer SECRET_KEY env (injected from Secrets Manager by task definition)
        self.SECRET_KEY = os.getenv("SECRET_KEY", "")
        if not self.SECRET_KEY:
            try:
                jwt_secret_name = os.getenv("JWT_SECRET_NAME", "") or "clockko-jwt-secret"
                jwt_secret = get_secret(jwt_secret_name)
                self.SECRET_KEY = jwt_secret.get("SECRET_KEY") or jwt_secret.get("value") or "your-local-secret"
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

        # ====================
        # Google OAuth
        # ====================
        try:
            google_creds = get_secret("clockko-google-oauth")
            self.GOOGLE_CLIENT_ID = google_creds["client_id"]
            self.GOOGLE_CLIENT_SECRET = google_creds["client_secret"]
        except Exception:
            self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
            self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
        self.SMTP_USER = os.getenv("SMTP_USER", "")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        self.SMTP_FROM = os.getenv("SMTP_FROM", "")
        self.SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ClockKo Team")

        # ====================
        # Application
        # ====================
        self.APP_NAME = "ClockKo API"
        self.DEBUG = os.getenv("DEBUG", "False").lower() == "true"
        # Allow comma-separated origins for CORS and derive a primary base URL for links
        origins_str = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.FRONTEND_URL = origins_str
        self.FRONTEND_URLS = [o.strip() for o in origins_str.split(",") if o.strip()]
        self.FRONTEND_URL_BASE = self.FRONTEND_URLS[0] if self.FRONTEND_URLS else "http://localhost:3000"
        # Region for AWS SDKs
        self.AWS_REGION = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "us-east-1"))

        # ====================
        # OTP Configuration
        # ====================
        self.OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
        self.OTP_LENGTH = 6

        # ====================
        # Google OAuth
        # ====================
        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

        # ====================
        # Two-Factor Authentication
        # ====================
        self.TWO_FACTOR_ENCRYPTION_KEY = os.getenv("TWO_FACTOR_ENCRYPTION_KEY", "")


settings = Settings()