# backend/app/services/nlp_service.py

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from typing import Dict, Any
import json

# Load environment variables for GOOGLE_API_KEY if not already loaded by FastAPI main
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL_NAME = "gemini-2.0-flash" # Use the same model as chatbot service

class NLPService:
    _instance = None
    _llm = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(NLPService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        if self._llm is None:
            if not GOOGLE_API_KEY:
                raise ValueError("GOOGLE_API_KEY environment variable not set for NLPService.")
            try:
                self._llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL_NAME, google_api_key=GOOGLE_API_KEY)
                # Small test call
                self._llm.invoke("Hello.")
                print(f"NLPService LLM (Gemini {GEMINI_MODEL_NAME}) initialized successfully.")
            except Exception as e:
                print(f"Error initializing NLPService LLM: {e}")
                raise ConnectionError(f"NLPService Gemini connection error: {e}")

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyzes the sentiment of the given text using Gemini LLM.
        Returns a dictionary with 'sentiment_label' (Positive, Negative, Neutral)
        and 'sentiment_score' (a float, if extracted).
        """
        if not text.strip():
            print("DEBUG: Empty text provided for sentiment analysis. Returning Neutral.")
            return {"sentiment_label": "Neutral", "sentiment_score": 0.0}

        # Prompt engineering for sentiment analysis
        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template("""
            You are a highly accurate sentiment analysis AI. Analyze the user's journal entry and determine its overall sentiment.
            Provide the sentiment label as one of: "Positive", "Negative", or "Neutral".
            Also, provide a sentiment score between -1.0 (most negative) and 1.0 (most positive). If sentiment is neutral, score should be 0.0.
            Respond ONLY with a JSON object. Ensure the JSON is perfectly valid and contains ONLY the JSON object, nothing else.
            No preamble, no explanation, no markdown backticks outside the JSON.
            Example for positive: {{"sentiment_label": "Positive", "sentiment_score": 0.85}}
            Example for neutral/mixed: {{"sentiment_label": "Neutral", "sentiment_score": 0.1}}
            Example for negative: {{"sentiment_label": "Negative", "sentiment_score": -0.7}}
            """),
            HumanMessagePromptTemplate.from_template("Analyze the sentiment of this text: {text}")
        ])

        chain = prompt_template | self._llm

        try:
            response_str_message = await chain.ainvoke({"text": text})
            raw_response_content = response_str_message.content

            print(f"DEBUG: Raw LLM response for sentiment: '{raw_response_content}'")

            # Handle common Gemini response formats
            # Strip markdown code blocks if present
            if raw_response_content.strip().startswith("```json"):
                json_start = raw_response_content.find("```json") + 7
                json_end = raw_response_content.find("```", json_start)
                if json_end != -1:
                    json_str = raw_response_content[json_start:json_end].strip()
                    print(f"DEBUG: Extracted JSON from markdown: '{json_str}'")
                else:
                    json_str = raw_response_content[json_start:].strip()
                    print(f"DEBUG: Extracted JSON from markdown (no end): '{json_str}'")
            elif raw_response_content.strip().startswith("```"):
                # Generic code block
                json_start = raw_response_content.find("```") + 3
                json_end = raw_response_content.find("```", json_start)
                if json_end != -1:
                    json_str = raw_response_content[json_start:json_end].strip()
                    print(f"DEBUG: Extracted JSON from generic code block: '{json_str}'")
                else:
                    json_str = raw_response_content[json_start:].strip()
                    print(f"DEBUG: Extracted JSON from generic code block (no end): '{json_str}'")
            else:
                json_str = raw_response_content.strip()

            try:
                sentiment_data = json.loads(json_str)
                label = sentiment_data.get("sentiment_label")
                score = sentiment_data.get("sentiment_score")

                if label in ["Positive", "Negative", "Neutral"] and isinstance(score, (int, float)):
                    print(f"DEBUG: Successfully parsed sentiment - Label: {label}, Score: {score}")
                    return {"sentiment_label": label, "sentiment_score": float(score)}
                else:
                    print(f"WARNING: LLM returned valid JSON but with unexpected keys/values: {json_str}")
                    return {"sentiment_label": "Neutral", "sentiment_score": 0.0}

            except json.JSONDecodeError:
                print(f"WARNING: LLM response was not valid JSON. Response: '{json_str}'")
                return {"sentiment_label": "Neutral", "sentiment_score": 0.0}

        except Exception as e:
            print(f"ERROR: During sentiment analysis LLM call for text: '{text[:50]}...' Error: {e}")
            return {"sentiment_label": "Neutral", "sentiment_score": 0.0}


# Initialize the service globally (singleton)
nlp_service_instance = NLPService()