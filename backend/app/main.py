from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base # Import engine and Base for table creation (for initial dev)
from .auth import routes as auth_routes # Import auth routes
from .api import mood, journal # <-- ADDED: Import new routers

# Create all database tables (for development, Alembic handles this in production)
# This will try to create tables if they don't exist based on your models.
# In a real production setup, Alembic migrations are preferred.
# Base.metadata.create_all(bind=engine) # Comment this out once you're confident with Alembic

app = FastAPI(
    title="Mental Health & Self-Help Assistant API",
    description="Backend API for the Mental Health & Self-Help Assistant.",
    version="0.1.0",
)

# Configure CORS (Cross-Origin Resource Sharing)
# This is essential for your React frontend to communicate with your FastAPI backend.
origins = [
    "http://localhost",
    "http://localhost:3000", # Default Next.js frontend port
    "http://localhost:5173", # Default Vite/React port if you use that
    # Add your deployed frontend URL here when you deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allow all headers
)

# Include your API routers
app.include_router(auth_routes.router)
app.include_router(mood.router)    # <-- ADDED
app.include_router(journal.router) # <-- ADDED

@app.get("/")
def read_root():
    return {"message": "Welcome to the Mental Health Assistant API!"}

# You can add more routers here later for chat, etc.
# from .api import chat
# app.include_router(chat.router)