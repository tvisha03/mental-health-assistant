from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud, models
from ..database import get_db
from ..auth.routes import get_current_user # Import the dependency

router = APIRouter(
    prefix="/mood",
    tags=["Mood Tracking"]
)

@router.post("/", response_model=schemas.MoodEntry, status_code=status.HTTP_201_CREATED)
def create_mood_entry(
    mood_entry: schemas.MoodEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new mood entry for the authenticated user.
    """
    return crud.create_user_mood_entry(db=db, mood_entry=mood_entry, user_id=current_user.id)

@router.get("/", response_model=List[schemas.MoodEntry])
def read_mood_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve all mood entries for the authenticated user.
    """
    mood_entries = crud.get_user_mood_entries(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return mood_entries

@router.get("/{mood_entry_id}", response_model=schemas.MoodEntry)
def read_mood_entry(
    mood_entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve a specific mood entry by ID for the authenticated user.
    """
    db_mood_entry = crud.get_user_mood_entry(db=db, mood_entry_id=mood_entry_id, user_id=current_user.id)
    if db_mood_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mood entry not found")
    return db_mood_entry

@router.delete("/{mood_entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mood_entry(
    mood_entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete a specific mood entry by ID for the authenticated user.
    """
    db_mood_entry = crud.delete_user_mood_entry(db=db, mood_entry_id=mood_entry_id, user_id=current_user.id)
    if db_mood_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mood entry not found")
    return
