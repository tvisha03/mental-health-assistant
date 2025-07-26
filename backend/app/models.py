from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (will add later)
    #mood_entries = relationship("MoodEntry", back_populates="owner")
    #journal_entries = relationship("JournalEntry", back_populates="owner")
    #goals = relationship("Goal", back_populates="owner")
    # Add other relationships as you create those models