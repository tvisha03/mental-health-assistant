from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

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