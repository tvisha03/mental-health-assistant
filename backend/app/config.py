import os
from dotenv import load_dotenv

load_dotenv() # Ensure .env is loaded here when config.py is imported

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    JWT_SECRET: str = os.getenv("JWT_SECRET")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Add a print statement here to see what's loaded
    def __init__(self):
        print(f"DEBUG (config.py): DATABASE_URL found: {self.DATABASE_URL is not None}")
        if self.DATABASE_URL:
            print(f"DEBUG (config.py): DATABASE_URL value: {self.DATABASE_URL}")
        else:
            print("DEBUG (config.py): DATABASE_URL is None. Check .env file and loading.")


settings = Settings()