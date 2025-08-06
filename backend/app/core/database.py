import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment variable or default to SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./clockko.db"  # Default to SQLite for development
)

# Create SQLAlchemy engine with database-specific configurations
if "sqlite" in DATABASE_URL:
    # SQLite-specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=os.getenv("DEBUG", "False").lower() == "true"  # Enable SQL logging in debug mode
    )
elif "postgresql" in DATABASE_URL:
    # PostgreSQL-specific configuration
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before use
        echo=os.getenv("DEBUG", "False").lower() == "true"
    )
else:
    # Generic configuration for other databases
    engine = create_engine(
        DATABASE_URL,
        echo=os.getenv("DEBUG", "False").lower() == "true"
    )

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


def get_database_type():
    """
    Helper function to determine which database is being used
    Useful for database-specific operations
    """
    if "sqlite" in DATABASE_URL:
        return "sqlite"
    elif "postgresql" in DATABASE_URL:
        return "postgresql"
    else:
        return "unknown"
