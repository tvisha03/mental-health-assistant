from sqlalchemy.orm import Session
from . import models, schemas
from .auth import security # Import security for password hashing

# Function to get a user by email
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# Function to create a new user
def create_user(db: Session, user: schemas.UserCreate):
    # Hash the password before storing it
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Refresh the instance to get the new ID from the DB
    return db_user

# Add other CRUD operations as needed later (e.g., get_user_by_id, update_user)


# --- CRUD for MoodEntry ---
def create_user_mood_entry(db: Session, mood_entry: schemas.MoodEntryCreate, user_id: int):
    db_mood_entry = models.MoodEntry(**mood_entry.dict(), owner_id=user_id)
    db.add(db_mood_entry)
    db.commit()
    db.refresh(db_mood_entry)
    return db_mood_entry

def get_user_mood_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MoodEntry).filter(models.MoodEntry.owner_id == user_id).order_by(models.MoodEntry.timestamp.desc()).offset(skip).limit(limit).all()

def get_user_mood_entry(db: Session, mood_entry_id: int, user_id: int):
    return db.query(models.MoodEntry).filter(models.MoodEntry.id == mood_entry_id, models.MoodEntry.owner_id == user_id).first()

def delete_user_mood_entry(db: Session, mood_entry_id: int, user_id: int):
    db_mood_entry = db.query(models.MoodEntry).filter(models.MoodEntry.id == mood_entry_id, models.MoodEntry.owner_id == user_id).first()
    if db_mood_entry:
        db.delete(db_mood_entry)
        db.commit()
    return db_mood_entry # Returns deleted object or None


# --- CRUD for JournalEntry ---
def create_user_journal_entry(db: Session, journal_entry: schemas.JournalEntryCreate, user_id: int):
    db_journal_entry = models.JournalEntry(**journal_entry.dict(), owner_id=user_id)
    db.add(db_journal_entry)
    db.commit()
    db.refresh(db_journal_entry)
    return db_journal_entry

def get_user_journal_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.JournalEntry).filter(models.JournalEntry.owner_id == user_id).order_by(models.JournalEntry.timestamp.desc()).offset(skip).limit(limit).all()

def get_user_journal_entry(db: Session, journal_entry_id: int, user_id: int):
    return db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_entry_id, models.JournalEntry.owner_id == user_id).first()

def update_user_journal_entry(db: Session, journal_entry_id: int, user_id: int, update_data: dict):
    db_journal_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_entry_id, models.JournalEntry.owner_id == user_id).first()
    if db_journal_entry:
        for key, value in update_data.items():
            setattr(db_journal_entry, key, value)
        db.commit()
        db.refresh(db_journal_entry)
    return db_journal_entry

def delete_user_journal_entry(db: Session, journal_entry_id: int, user_id: int):
    db_journal_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_entry_id, models.JournalEntry.owner_id == user_id).first()
    if db_journal_entry:
        db.delete(db_journal_entry)
        db.commit()
    return db_journal_entry