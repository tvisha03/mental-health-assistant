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