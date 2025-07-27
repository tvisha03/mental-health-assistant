from sqlalchemy import Column, Integer, String, DateTime, func, Boolean, ForeignKey
from sqlalchemy.orm import relationship
# --- NEW IMPORT for PostgreSQL Array type ---
from sqlalchemy.dialects.postgresql import ARRAY # <-- ADD THIS IMPORT
# --- END NEW IMPORT ---

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    mood_entries = relationship("MoodEntry", back_populates="owner", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="owner", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="owner", cascade="all, delete-orphan")

# --- MODIFIED MODEL: MoodEntry (add 'tags' column) ---
class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    mood_value = Column(Integer, nullable=False) # e.g., 1 to 5 scale
    notes = Column(String, nullable=True) # Optional brief notes
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    tags = Column(ARRAY(String), nullable=True) # <-- ADD THIS LINE for tags (e.g., ['work', 'stress'])

    owner = relationship("User", back_populates="mood_entries")


# --- JournalEntry and Goal models remain unchanged for now ---
class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="journal_entries")


class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="goals")