from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List # <-- ADD List import

# Pydantic model for user creation (what we expect from client for registration)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Pydantic model for user response (what we send back to client)
# Excludes sensitive info like password hash
class User(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None # Allow None for updated_at initially
    full_name: Optional[str] = None # <-- ADD
    date_of_birth: Optional[datetime] = None # <-- ADD
    gender: Optional[str] = None # <-- ADD
    triggers: Optional[List[str]] = None # <-- ADD
    areas_of_focus: Optional[List[str]] = None # <-- ADD

    model_config = {"from_attributes": True}

# Pydantic model for user login (what we expect for login request)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Pydantic model for JWT Token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Pydantic model for Token Data (what's inside the JWT)
class TokenData(BaseModel):
    email: Optional[str] = None


# --- MOOD ENTRY SCHEMAS ---

# Pydantic model for creating a Mood Entry
class MoodEntryCreate(BaseModel):
    mood_value: int # e.g., 1 to 5
    notes: Optional[str] = None
    tags: Optional[List[str]] = None # <-- ADD THIS LINE: list of strings for tags

# Pydantic model for Mood Entry response (what we send back)
class MoodEntry(BaseModel):
    id: int
    mood_value: int
    notes: Optional[str] = None
    timestamp: datetime
    owner_id: int
    tags: Optional[List[str]] = None # <-- ADD THIS LINE

    model_config = {"from_attributes": True}


# --- JOURNAL ENTRY SCHEMAS ---

# Pydantic model for creating a Journal Entry
class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: str

# Pydantic model for Journal Entry response
class JournalEntry(BaseModel):
    id: int
    title: Optional[str] = None
    content: str
    timestamp: datetime
    owner_id: int
    sentiment_label: Optional[str] = None # <-- ADD THIS
    sentiment_score: Optional[float] = None # <-- ADD THIS

    model_config = {"from_attributes": True}


# --- GOAL SCHEMAS ---

# Pydantic model for creating a Goal (placeholder for now)
class GoalCreate(BaseModel):
    description: str
    target_date: Optional[datetime] = None # Or use date type if you prefer just date
    completed: bool = False

class Goal(BaseModel):
    id: int
    description: str
    target_date: Optional[datetime] = None
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int

    model_config = {"from_attributes": True}

# --- NEW SCHEMA: ChatMessage ---
class ChatMessage(BaseModel):
    id: int
    owner_id: int
    content: str
    timestamp: datetime
    is_user_message: bool

    model_config = {"from_attributes": True}

# --- NEW SCHEMA: UserProfileUpdate ---
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None # Or date
    gender: Optional[str] = None
    triggers: Optional[List[str]] = None
    areas_of_focus: Optional[List[str]] = None