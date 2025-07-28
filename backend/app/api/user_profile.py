from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from .. import schemas, crud, models
from ..database import get_db
from ..auth.routes import get_current_user # Import the dependency

router = APIRouter(
    prefix="/user-profile",
    tags=["User Profile"]
)

@router.get("/me", response_model=schemas.User)
def read_current_user_profile(
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve the profile of the authenticated user.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
def update_current_user_profile(
    profile_data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update the profile of the authenticated user.
    """
    updated_user = crud.update_user_profile(db=db, user=current_user, profile_data=profile_data)
    return updated_user
