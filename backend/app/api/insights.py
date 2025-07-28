from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .. import crud, models
from ..database import get_db
from ..auth.routes import get_current_user # Dependency to protect routes

router = APIRouter(
    prefix="/insights",
    tags=["Insights"]
)

@router.get("/mood/tags", response_model=List[Dict[str, Any]])
def get_mood_tags_insights(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves the most frequent mood tags for the authenticated user.
    """
    return crud.get_most_frequent_mood_tags(db=db, user_id=current_user.id, limit=limit)

@router.get("/mood/avg-by-day", response_model=List[Dict[str, Any]])
def get_average_mood_by_day_of_week_api(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Calculates the average mood for each day of the week for the authenticated user.
    """
    return crud.get_average_mood_by_day_of_week(db=db, user_id=current_user.id)

@router.get("/journal/sentiment-summary", response_model=Dict[str, Any])
def get_journal_sentiment_summary_api(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Provides a basic summary of journal sentiment distribution for the authenticated user.
    """
    return crud.get_journal_sentiment_summary(db=db, user_id=current_user.id)