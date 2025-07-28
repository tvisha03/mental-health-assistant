from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .. import schemas, crud, models
from ..database import get_db
from ..auth.routes import get_current_user # Import the dependency

router = APIRouter(
    prefix="/journal",
    tags=["Journaling"]
)

# --- MODIFIED: Make async and await CRUD calls ---
@router.post("/", response_model=schemas.JournalEntry, status_code=status.HTTP_201_CREATED)
async def create_journal_entry( # <-- MAKE ASYNC
    journal_entry: schemas.JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new journal entry for the authenticated user with sentiment analysis.
    """
    return await crud.create_user_journal_entry(db=db, journal_entry=journal_entry, user_id=current_user.id) # <-- AWAIT

@router.get("/", response_model=List[schemas.JournalEntry])
def read_journal_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve all journal entries for the authenticated user.
    """
    journal_entries = crud.get_user_journal_entries(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return journal_entries

@router.get("/{journal_entry_id}", response_model=schemas.JournalEntry)
def read_journal_entry(
    journal_entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve a specific journal entry by ID for the authenticated user.
    """
    db_journal_entry = crud.get_user_journal_entry(db=db, journal_entry_id=journal_entry_id, user_id=current_user.id)
    if db_journal_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
    return db_journal_entry

@router.put("/{journal_entry_id}", response_model=schemas.JournalEntry)
async def update_journal_entry( # <-- MAKE ASYNC
    journal_entry_id: int,
    update_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update a specific journal entry by ID for the authenticated user with sentiment re-analysis.
    Supports partial updates.
    """
    db_journal_entry = crud.get_user_journal_entry(db=db, journal_entry_id=journal_entry_id, user_id=current_user.id)
    if db_journal_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")

    updated_entry = await crud.update_user_journal_entry(db=db, journal_entry_id=journal_entry_id, user_id=current_user.id, update_data=update_data) # <-- AWAIT
    return updated_entry

@router.delete("/{journal_entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    journal_entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete a specific journal entry by ID for the authenticated user.
    """
    db_journal_entry = crud.delete_user_journal_entry(db=db, journal_entry_id=journal_entry_id, user_id=current_user.id)
    if db_journal_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
    return

# --- NEW ROUTE for Journal Streak ---
@router.get("/streak/", response_model=Dict[str, int]) # Returns a dictionary like {"streak": 5}
def get_journal_streak_api(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve the current consecutive daily journal streak for the authenticated user.
    """
    streak = crud.get_journal_streak(db=db, user_id=current_user.id)
    return {"streak": streak}
