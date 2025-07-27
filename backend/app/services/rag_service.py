import os
from dotenv import load_dotenv # <-- Ensure load_dotenv is imported
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
# from langchain_community.llms import Ollama # <-- COMMENT OUT or REMOVE this import
from langchain_google_genai import ChatGoogleGenerativeAI # <-- ADD THIS IMPORT for Gemini
from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from fastapi import HTTPException # <-- ADD THIS IMPORT

from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .. import models, crud

# --- Configuration ---
CHROMA_PERSIST_DIRECTORY = "./chroma_db"
# OLLAMA_MODEL_NAME = "mistral" # <-- COMMENT OUT or REMOVE
# OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434") # <-- COMMENT OUT or REMOVE

# NEW: Gemini specific configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") # <-- ADD THIS
GEMINI_MODEL_NAME = "gemini-2.0-flash" 
# --- End Configuration ---

class ChatbotService:
    _instance = None
    _llm = None
    _retriever = None
    _conversation_chain = None
    _embeddings = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ChatbotService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        print("Initializing ChatbotService components...")

        # Initialize Embeddings (still using SentenceTransformers for ChromaDB)
        if self._embeddings is None:
            self._embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
            print("Embeddings model loaded.")

        # Initialize ChromaDB as Retriever
        if self._retriever is None:
            if not os.path.exists(CHROMA_PERSIST_DIRECTORY):
                print(f"Error: ChromaDB directory '{CHROMA_PERSIST_DIRECTORY}' not found.")
                print("Please run 'python ingest_data.py' from the backend directory to create the knowledge base.")
                raise FileNotFoundError(f"Chatbot knowledge base not found at {CHROMA_PERSIST_DIRECTORY}.")

            print("Loading ChromaDB from persistence...")
            vectordb = Chroma(
                persist_directory=CHROMA_PERSIST_DIRECTORY,
                embedding_function=self._embeddings
            )
            self._retriever = vectordb.as_retriever(search_kwargs={"k": 3})
            print("ChromaDB retriever initialized.")

        # --- MODIFIED: Initialize Gemini LLM instead of Ollama ---
        if self._llm is None:
            if not GOOGLE_API_KEY:
                raise ValueError("GOOGLE_API_KEY environment variable not set. Please get an API key from Google AI Studio.")
            try:
                self._llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL_NAME, google_api_key=GOOGLE_API_KEY)
                # Small test call to verify connection
                self._llm.invoke("Hello, are you there?")
                print(f"Gemini LLM initialized and test successful with model: {GEMINI_MODEL_NAME}")
            except Exception as e:
                print(f"Error: Gemini LLM not reachable or configuration issue. Details: {e}")
                raise ConnectionError(f"Gemini connection error: {e}") # Raise a specific error
        # --- END MODIFIED ---

        # Initialize Conversation Chain
        if self._conversation_chain is None:
            system_template = """
            You are a compassionate, non-judgmental mental health and self-help assistant.
            Your goal is to provide supportive, evidence-based self-help strategies, information,
            and coping mechanisms based on the provided context documents.
            You are NOT a licensed therapist, doctor, or medical professional.
            Always encourage users to seek professional help if they are in crisis or need clinical advice.
            Respond in a calm, encouraging, and helpful tone.

            Here is recent context about the user from their mood and journal entries:
            {user_context}

            Use the following retrieved context documents to answer the question:
            {context}

            Chat History:
            {chat_history}
            """

            self._conversation_chain = ConversationalRetrievalChain.from_llm(
                llm=self._llm,
                retriever=self._retriever,
                return_source_documents=True,
                combine_docs_chain_kwargs={
                    "prompt": ChatPromptTemplate.from_messages([
                        SystemMessagePromptTemplate.from_template(system_template),
                        HumanMessagePromptTemplate.from_template("{question}")
                    ])
                }
            )
            print("ConversationalRetrievalChain initialized with custom prompt.")

    # ... (rest of get_chatbot_response function, it remains largely the same) ...
    async def get_chatbot_response(self, user_id: int, user_message: str, db: Session):
        # --- MODIFIED: Fetching & Formatting Chat History for LLM ---
        db_chat_messages = crud.get_user_chat_messages(db, user_id, limit=10) # Fetch last 10 messages
        chat_history_for_llm = [] # Use a new variable name to avoid confusion

        user_msg_buffer = None
        for msg in db_chat_messages:
            if msg.is_user_message:
                user_msg_buffer = msg.content
            else: # It's an AI message
                if user_msg_buffer is not None:
                    chat_history_for_llm.append((user_msg_buffer, msg.content))
                    user_msg_buffer = None # Reset buffer after pairing
                else:
                    chat_history_for_llm.append(("", msg.content))

        # --- Personalization & Context (remains the same) ---
        mood_summary = "No recent mood entries available."
        recent_mood_trends = crud.get_mood_trends(db, user_id, days=7)
        if recent_mood_trends:
            actual_moods = [m for m in recent_mood_trends if m['average_mood'] > 0]
            if actual_moods:
                latest_mood_val = actual_moods[-1]['average_mood']
                mood_summary = f"User's average mood in the last 7 days is {latest_mood_val:.1f}."

        journal_summary = "No recent journal entries available."
        recent_journal_entries = crud.get_user_journal_entries(db, user_id, limit=2)
        if recent_journal_entries:
            journal_summary_parts = []
            for entry in recent_journal_entries:
                content_preview = entry.content[:100].replace('\n', ' ') + '...' if len(entry.content) > 100 else entry.content
                journal_summary_parts.append(f"'{entry.title or 'Journal Entry'}: {content_preview}'")
            journal_summary = "Recent journal entries include: " + "; ".join(journal_summary_parts)

        user_context_string = f"Mood data: {mood_summary}. Journal data: {journal_summary}."

        # Invoke the chain
        try:
            result = await self._conversation_chain.ainvoke(
                {"question": user_message, "chat_history": chat_history_for_llm, "user_context": user_context_string} # <-- USE THE NEW VARIABLE HERE
            )
            ai_response = result['answer']
            source_documents = result.get('source_documents', [])

            # Store the conversation in DB for future memory
            crud.create_chat_message(db, user_id, user_message, is_user_message=True)
            crud.create_chat_message(db, user_id, ai_response, is_user_message=False)

            return {"response": ai_response, "sources": [{"content": doc.page_content, "metadata": doc.metadata} for doc in source_documents]}

        except Exception as e:
            print(f"Error during LLM invocation: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Chatbot processing error. Please try again. Details: {e}"
            )

chatbot_service_instance = ChatbotService()