import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app.core.config import settings

# Load environment variables
load_dotenv()

DATABASE_URL = settings.DATABASE_URL

# Create SQLAlchemy engine with database-specific configurations
if "sqlite" in DATABASE_URL:
    # SQLite-specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
elif "postgresql" in DATABASE_URL:
    # PostgreSQL-specific configuration
    # Use sslmode=prefer for development (falls back to non-SSL), require for production
    ssl_mode = "require" if not settings.DEBUG else "prefer"
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        echo=settings.DEBUG,
        connect_args={"sslmode": ssl_mode}    
        )
else:
    # Generic configuration for other databases
    engine = create_engine(DATABASE_URL, echo=settings.DEBUG)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session
    Yields a database session and ensures it's closed after use
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session():
    """
    Utility to create a new Session for use in Celery tasks or other contexts.
    Ensures fresh session for concurrency safety.
    """
    db = SessionLocal()
    try:
        db.begin()
        yield db
    finally:
        db.close()


def get_database_type():
    """
    Helper function to determine which database is being used
    Useful for database-specific operations
    """
    if "sqlite" in DATABASE_URL:
        return "sqlite"
    elif "postgresql" in DATABASE_URL:
        return "postgresql"
    return "unknown"
