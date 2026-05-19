from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# This creates/connects to a file called phishing.db in your backend folder
DATABASE_URL = "sqlite:///./phishing.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# This is your SCAN table
class ScanRecord(Base):
    __tablename__ = "scans"

    id              = Column(Integer, primary_key=True, index=True)
    url             = Column(String, nullable=False)
    heuristic_score = Column(Float)
    ml_score        = Column(Float)
    hybrid_score    = Column(Float)
    verdict         = Column(String)   # "Safe" or "Phishing"
    source          = Column(String)   # "portal" or "extension"
    scanned_at      = Column(DateTime, default=datetime.now)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()