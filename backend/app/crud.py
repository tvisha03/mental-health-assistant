from sqlalchemy.orm import Session
# --- MODIFIED: Add DATE import ---
from sqlalchemy import func, extract, DATE # <-- ADD DATE here
# --- END MODIFIED ---
from datetime import datetime, timedelta, date # <-- ADD date import here
from typing import List, Dict, Any, Optional

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


# --- NEW CRUD Function for Aggregated Mood Data ---
def get_mood_trends(db: Session, user_id: int, days: int = 7):
    """
    Retrieves aggregated daily average mood over a specified number of days.
    """
    end_date = datetime.now().date() # Current date
    start_date = end_date - timedelta(days=days - 1) # Go back 'days' from today

    # Subquery to truncate timestamp to date and calculate daily average
    daily_avg_mood = (
        db.query(
            func.date_trunc('day', models.MoodEntry.timestamp).label('date'),
            func.avg(models.MoodEntry.mood_value).label('average_mood')
        )
        .filter(
            models.MoodEntry.owner_id == user_id,
            # --- MODIFIED LINE HERE ---
            func.date_trunc('day', models.MoodEntry.timestamp).cast(DATE) >= start_date, # Use imported DATE type
            # --- END MODIFIED LINE ---
            func.date_trunc('day', models.MoodEntry.timestamp).cast(DATE) <= end_date  # <-- And here too!
        )
        .group_by('date')
        .order_by('date')
        .subquery()
    )

    # Generate a series of dates for the full range (even if no entries)
    # This ensures your chart has continuous dates
    date_series = (
        db.query(
            func.generate_series(start_date, end_date, '1 day').cast(DATE).label('date') # <-- And here!
        ).subquery()
    )

    # Left join to include all dates in the range, even those with no mood entries
    # Coalesce to fill null average_mood with 0 or a default value for frontend charting
    results = db.query(
        date_series.c.date,
        func.coalesce(daily_avg_mood.c.average_mood, 0).label('average_mood') # Use 0 or another default
    ).outerjoin(
        daily_avg_mood,
        date_series.c.date == daily_avg_mood.c.date
    ).order_by(date_series.c.date).all()

    # Convert results to a list of dictionaries for easier JSON serialization
    # Each item will be {'date': 'YYYY-MM-DD', 'average_mood': X.X}
    return [
        {"date": r.date.isoformat(), "average_mood": round(float(r.average_mood), 2)}
        for r in results
    ]


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


# --- NEW CRUD Function for Journal Streak ---
def get_journal_streak(db: Session, user_id: int) -> int:
    """
    Calculates the current consecutive daily journal streak for a user.
    A streak is maintained if the user has at least one entry for consecutive days
    up to yesterday, or today if an entry for today exists.
    """
    today = datetime.now().date() # Today's date
    
    # Get all distinct dates with journal entries for the user, ordered descending
    journal_dates = (
        db.query(func.date(models.JournalEntry.timestamp))
        .filter(models.JournalEntry.owner_id == user_id)
        .distinct()
        .order_by(func.date(models.JournalEntry.timestamp).desc())
        .all()
    )

    dates = [d[0] for d in journal_dates] # Extract date objects

    if not dates:
        return 0 # No journal entries, no streak

    current_streak = 0
    expected_date = today

    # Check if there's an entry for today
    if dates and dates[0] == today:
        current_streak = 1
        expected_date = today - timedelta(days=1)
    # If no entry for today, check for yesterday's entry to start the streak
    elif dates and dates[0] == today - timedelta(days=1):
        current_streak = 1
        expected_date = today - timedelta(days=2)
    else:
        return 0 # No entry for today or yesterday, streak is broken

    # Iterate through past dates to extend the streak
    for i in range(1, len(dates)):
        if dates[i] == expected_date:
            current_streak += 1
            expected_date -= timedelta(days=1)
        else:
            break # Gap found, streak broken

    return current_streak


# --- NEW CRUD Functions for ChatMessage ---
def create_chat_message(db: Session, user_id: int, content: str, is_user_message: bool):
    db_chat_message = models.ChatMessage(
        owner_id=user_id,
        content=content,
        is_user_message=is_user_message
    )
    db.add(db_chat_message)
    db.commit()
    db.refresh(db_chat_message)
    return db_chat_message

def get_user_chat_messages(db: Session, user_id: int, skip: int = 0, limit: int = 20):
    """
    Retrieve chat messages for a specific user, ordered by timestamp.
    `limit` determines how much history is passed to the LLM.
    """
    return db.query(models.ChatMessage).filter(models.ChatMessage.owner_id == user_id).order_by(models.ChatMessage.timestamp).offset(skip).limit(limit).all()

# --- NEW CRUD Function for User Profile Update ---
def update_user_profile(db: Session, user: models.User, profile_data: schemas.UserProfileUpdate):
    update_data = profile_data.dict(exclude_unset=True) # Only update fields that are provided
    for key, value in update_data.items():
        setattr(user, key, value)
    db.add(user) # Or db.merge(user) for detached instances
    db.commit()
    db.refresh(user)
    return user