from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List

from .. import schemas, models, crud
from ..database import get_db
from ..auth.routes import get_current_user
from ..services.rag_service import chatbot_service_instance as chatbot_service # Import the singleton instance

router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"]
)

class ChatMessageIn(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] # To include source documents from RAG

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    chat_message: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Send a message to the AI chatbot and get a response.
    Incorporates RAG and conversational memory.
    """
    try:
        # The chatbot service handles fetching memory, running RAG, and storing new messages
        response_data = await chatbot_service.get_chatbot_response(
            user_id=current_user.id,
            user_message=chat_message.message,
            db=db
        )
        return response_data
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot knowledge base not found. Please run ingestion script: {e}"
        )
    except ConnectionRefusedError as e: # Catch the specific Ollama connection error
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, # 503 Service Unavailable
            detail=f"Chatbot LLM (Ollama) is not reachable or model not loaded. Please ensure Ollama is running and the '{chatbot_service.OLLAMA_MODEL_NAME}' model is pulled. Details: {e}"
        )
    except Exception as e:
        print(f"Chatbot error: {e}") # Log the specific error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred with the chatbot. Please try again. If the problem persists, contact support."
        )

# Optional: Add an endpoint to get full chat history for a user
@router.get("/history", response_model=List[schemas.ChatMessage])
def get_chat_history_for_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """
    Retrieve past chat messages for the authenticated user.
    """
    messages = crud.get_user_chat_messages(db, current_user.id, skip=skip, limit=limit)
    return messages