from sqlalchemy import Column, Integer, String, DateTime, func, Boolean, ForeignKey
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

    # --- UNCOMMENT AND ADD RELATIONSHIPS HERE ---
    mood_entries = relationship("MoodEntry", back_populates="owner", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="owner", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="owner", cascade="all, delete-orphan")
    # Note: `cascade="all, delete-orphan"` ensures that if a user is deleted,
    # their associated mood entries, journal entries, and goals are also deleted.
    # Be careful with this in production if you need different behavior.


# --- NEW MODEL: MoodEntry ---
class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    mood_value = Column(Integer, nullable=False) # e.g., 1 to 5 scale
    notes = Column(String, nullable=True) # Optional brief notes
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Link to User

    owner = relationship("User", back_populates="mood_entries")


# --- NEW MODEL: JournalEntry ---
class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True) # Optional title for the journal entry
    content = Column(String, nullable=False) # The actual journal text
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Link to User

    owner = relationship("User", back_populates="journal_entries")


# --- NEW MODEL: Goal (Placeholder for now, will be detailed later) ---
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Link to User

    owner = relationship("User", back_populates="goals")