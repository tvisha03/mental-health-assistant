# 🧠 Mental Health & Self-Help AI Assistant

## Project Overview

The **Mental Health & Self-Help AI Assistant** is a full-stack web application designed to provide personalized support and tools for mental well-being. Leveraging cutting-edge AI (specifically Retrieval-Augmented Generation - RAG) alongside robust data tracking features, it aims to empower users in managing their emotional health, reflecting through journaling, and gaining insights into their well-being patterns.

This project was built from scratch as a comprehensive learning exercise, covering a modern MERN-like stack (Python backend, React/Next.js frontend, PostgreSQL database) with advanced AI integration.

## Table of Contents

1.  [Features](#features)
2.  [Tech Stack](#tech-stack)
3.  [Architecture](#architecture)
4.  [Getting Started (Local Development Setup)](#getting-started-local-development-setup)
    * [Prerequisites](#prerequisites)
    * [Cloning the Repository](#1-cloning-the-repository)
    * [Docker Services Setup](#2-docker-services-setup-postgresql-and-ollama)
    * [Backend Setup](#3-backend-setup)
    * [RAG Knowledge Base Ingestion](#4-rag-knowledge-base-ingestion)
    * [Frontend Setup](#5-frontend-setup)
    * [Running the Application](#6-running-the-application)
5.  [Usage Guide](#usage-guide)
6.  [Key Implementation Details & Design Choices](#key-implementation-details--design-choices)
7.  [Ethical Considerations & Disclaimers](#ethical-considerations--disclaimers)
8.  [Future Enhancements / Roadmap](#future-enhancements--roadmap)
9.  [Contributing](#contributing)
10. [License](#license)
11. [Contact](#contact)

## Features

This assistant offers a rich set of functionalities, built iteratively:

### Core Functionality & Personalization
* **User Authentication:** Secure user registration, login, and session management using JWT.
* **User Profiles:** Dedicated profile section to store personal details, common triggers, and areas of focus for enhanced personalization.
* **Global Navigation:** Intuitive top-right navigation bar with dropdown menus for profile settings and resources.
* **Dark Mode:** Seamless dark/light theme switching for improved user comfort.

### Mood Tracking & Journaling
* **Daily Mood Logging:** Users can log their daily mood on a 1-5 scale with optional notes and customizable tags.
* **Secure Journaling:** A private, rich-text (Markdown-supported) journaling feature for self-expression and reflection.
* **Journal Streak Tracker:** Visualizes the user's consecutive daily journaling streak on the Dashboard and a calendar view on the Journal page.
* **Mood & Journal History:** Comprehensive lists of past mood and journal entries.
* **Journal Search & Filter:** Filter journal entries by text content and date range on the frontend.

### Advanced Insights & Analytics
* **Mood Trend Visualization:** Interactive charts displaying daily average mood trends over time.
* **Mood Tag Analysis:** Shows the most frequently used mood tags.
* **Average Mood by Day of Week:** Visualizes mood patterns across different days of the week.
* **Journal Sentiment Analysis:** Automatically analyzes the sentiment (Positive, Negative, Neutral) of journal entries using an LLM and displays it.
* **Journal Sentiment Distribution:** Provides a summary of positive, negative, and neutral journal entry percentages.

### AI Assistant (Retrieval-Augmented Generation - RAG)
* **Intelligent Chatbot:** An AI assistant powered by Google's Gemini API and a custom knowledge base.
* **Retrieval-Augmented Generation (RAG):** The chatbot retrieves relevant information from a curated library of mental health documents to provide accurate and context-aware responses.
* **Personalized RAG:** Integrates user's recent mood trends and journal summaries directly into the LLM's prompt, allowing for more empathetic and personalized guidance.
* **Conversational Memory:** The chatbot remembers past interactions within a session for coherent dialogue.
* **Safety Filters:** Built-in logic to detect crisis keywords and immediately provide emergency hotline information and disclaimers.
* **Source Citation:** Displays the source document chunks used by the AI to generate its response (optional for transparency).

## Tech Stack

This project leverages a modern, robust, and cost-efficient (for development) tech stack:

### Backend (Python)
* **Language:** Python 3.10+
* **Web Framework:** [**FastAPI**](https://fastapi.tiangolo.com/) - High-performance, asynchronous web framework for building APIs.
* **AI/NLP Orchestration:** [**LangChain**](https://www.langchain.com/) - Framework for developing applications powered by language models.
* **Large Language Model (LLM):** [**Google Gemini API**](https://ai.google.dev/models/gemini) (`gemini-2.0-flash`) - Powerful, cloud-based LLM for chat and sentiment analysis (using its generous free tier). (Previously integrated with [Ollama](https://ollama.ai/) for local LLMs, which is still an option for local development).
* **Embeddings:** [**Sentence-Transformers**](https://www.sbert.net/) (`all-MiniLM-L6-v2`) - For generating vector embeddings from text content.
* **Vector Database:** [**ChromaDB**](https://www.trychroma.com/) - Lightweight, open-source vector store for storing and retrieving document embeddings.
* **Relational Database:** [**PostgreSQL**](https://www.postgresql.org/) - Robust and scalable relational database for structured data.
* **ORM (Object-Relational Mapper):** [**SQLAlchemy**](https://www.sqlalchemy.org/) (with `asyncpg` for async capabilities) - Python SQL toolkit and ORM that provides a high-level API for database interaction.
* **Database Migrations:** [**Alembic**](https://alembic.sqlalchemy.org/en/latest/) - Lightweight database migration tool for SQLAlchemy.
* **Authentication:** JWT (using `passlib[bcrypt]` for password hashing and `python-jose[cryptography]` for token handling).
* **Environment Management:** [**`python-dotenv`**](https://pypi.org/project/python-dotenv/) - For loading environment variables from `.env` files.
* **Data Validation:** [**Pydantic**](https://docs.pydantic.dev/latest/) - For data validation and settings management (used with FastAPI schemas).
* **Form Parsing:** [**`python-multipart`**](https://pypi.org/project/python-multipart/) - For handling form data.
* **Asynchronous Utilities:** [**`greenlet`**](https://greenlet.readthedocs.io/en/latest/) - Used by SQLAlchemy's async extensions.

### Frontend (React)
* **Framework:** [**Next.js**](https://nextjs.org/) (latest App Router, TypeScript) - React framework for building fast web applications.
* **State Management:** React Context API (for global auth and theme state) and React Hooks (useState, useEffect, useMemo, useCallback).
* **Styling:** [**Tailwind CSS**](https://tailwindcss.com/) (with [Typography Plugin](https://tailwindcss.com/docs/plugins#typography)) - Utility-first CSS framework for rapid UI development and responsive design.
* **HTTP Client:** [**Axios**](https://axios-http.com/) - Promise-based HTTP client for making API requests. Includes request and response interceptors for global authentication handling.
* **Charting:** [**Recharts**](https://recharts.org/) - Composable charting library built on React components for data visualization (mood trends, insights).
* **Calendar:** [**React-Calendar**](https://www.npmjs.com/package/react-calendar) - For the journal activity calendar.
* **Markdown Rendering:** [**React-Markdown**](https://github.com/remarkjs/react-markdown) and [**Rehype-Raw**](https://github.com/rehypejs/rehype-raw) - For rendering Markdown content in journal entries.
* **Select Inputs:** [**React-Select**](https://react-select.com/) - Flexible and customizable select/multi-select input components.

### Infrastructure & Development Tools
* **Containerization:** [**Docker**](https://www.docker.com/) & [**Docker Compose**](https://docs.docker.com/compose/) - For containerizing PostgreSQL and easily managing the multi-service application stack.
* **Version Control:** [**Git**](https://git-scm.com/) (hosted on GitHub, GitLab, etc.) - For tracking code changes.
* **Package Managers:** `pip` (Python), `npm` (Node.js).
* **IDE:** [**Visual Studio Code**](https://code.visualstudio.com/) (recommended).

## Architecture

The application follows a modular, client-server architecture:

* **Frontend (Next.js):** A single-page application (SPA) built with React and Next.js, serving the user interface. It communicates with the backend via RESTful API calls. The UI is designed to be responsive and supports dark mode.
* **Backend (FastAPI):** A high-performance Python API server that handles:
    * User authentication (JWT based).
    * CRUD operations for user data, mood entries, journal entries, chat messages, resources, and exercises.
    * Complex data aggregation for insights (e.g., mood trends, tag frequency, journal sentiment distribution).
    * Orchestration of the AI features.
* **Database (PostgreSQL):** A persistent relational database storing all structured application data (users, entries, messages, etc.).
* **Vector Database (ChromaDB):** An embedded vector store (runs as part of the backend process during development) that stores numerical embeddings of the curated mental health knowledge base documents. This is critical for the RAG functionality.
* **Large Language Model (Google Gemini):** A powerful cloud-based LLM that acts as the "brain" of the AI assistant. It processes user queries, generates responses, and performs tasks like sentiment analysis.
    * **Retrieval-Augmented Generation (RAG):** When a user asks a question, the backend first queries the ChromaDB to find relevant document chunks from the curated knowledge base. These chunks, along with the user's current message and conversation history, are then provided as context to Gemini. Gemini uses this context to formulate an accurate and relevant response.
    * **Personalized RAG:** User-specific data (recent mood trends, journal summaries) fetched from PostgreSQL is also injected into Gemini's prompt, enabling personalized and empathetic responses.

```mermaid
graph TD
    subgraph Frontend["Web Browser / Client App (Next.js)"]
        UI --> API_Calls
        UserAuthUI["Login/Register"] --> API_Calls
        MoodUI["Mood Tracking"] --> API_Calls
        JournalUI["Journaling"] --> API_Calls
        ChatUI["Chatbot Interface"] --> API_Calls
        ProfileUI["Profile Settings"] --> API_Calls
        InsightsUI["Insights Display"] --> API_Calls
        HeaderNav["Global Navigation"] --> UI
        DarkModeToggle["Dark Mode Toggle"] --> UI
    end

    subgraph Backend["FastAPI Application (Python)"]
        API_Calls --> Router["API Routers"]
        Router --> Auth["Auth Logic"]
        Router --> DataAPI["Mood/Journal/Profile/Resource/Exercise API"]
        Router --> InsightsAPI["Insights API"]
        Router --> ChatAPI["Chatbot API"]
        ChatAPI --> RAGService["RAG Service"]
        InsightsAPI --> CRUD["CRUD Operations"]
        DataAPI --> CRUD
        RAGService --> CRUD
        RAGService --> LLM["Google Gemini API"]
        RAGService --> VectorDB["ChromaDB"]
    end

    subgraph Databases["Data Storage"]
        CRUD --> PostgreSQL["PostgreSQL DB"]
        VectorDB --> LocalFiles["ChromaDB Files"]
    end

    subgraph External_Services["External Services"]
        LLM --> GoogleAPI["Google Gemini Cloud"]
    end

    PostgreSQL -.->|"Data Persistence"| LocalhostDB["Docker PostgreSQL Container"]
    LocalhostDB -.->|"DB Connection"| Backend
    GoogleAPI -.->|"API Calls"| LLM

    style Frontend fill:#f0f8ff,stroke:#333,stroke-width:2px
    style Backend fill:#e0ffe0,stroke:#333,stroke-width:2px
    style Databases fill:#fff0f0,stroke:#333,stroke-width:2px
    style External_Services fill:#f8f8ff,stroke:#333,stroke-width:2px
```

## Getting Started (Local Development Setup)

Follow these instructions to get your development environment set up and the application running on your local machine.

### Prerequisites

Ensure you have the following installed on your system:

  * **Python 3.10+**: Download and install from [python.org](https://www.python.org/downloads/). Ensure "Add Python to PATH" is checked during installation on Windows.
  * **Docker Desktop**: Download and install from [docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/). Ensure WSL 2 / Hyper-V is enabled on Windows.
  * **Node.js (LTS) & npm**: Download and install from [nodejs.org/en/download/](https://nodejs.org/en/download/). Alternatively, use a Node Version Manager (NVM) for flexible version control.
  * **Git**: [git-scm.com/downloads](https://git-scm.com/downloads).
  * **Google Gemini API Key**: Obtain a free API key from [aistudio.google.com/](https://aistudio.google.com/).
  * **Visual Studio Code (Recommended IDE)**: [code.visualstudio.com/](https://code.visualstudio.com/).

### 1\. Cloning the Repository

```bash
git clone https://github.com/your-username/mental-health-assistant.git # Replace with your repo URL
cd mental-health-assistant
```

### 2\. Docker Services Setup (PostgreSQL)

This will set up your PostgreSQL database using Docker Compose. We've removed Ollama from the default setup since we're using Gemini API.

1.  **Create `docker-compose.yml`** in the project root (`mental-health-assistant/`).
    ```yaml
    # mental-health-assistant/docker-compose.yml
    version: '3.8'

    services:
      db:
        image: postgres:16-alpine
        restart: always
        environment:
          POSTGRES_DB: mental_health_db
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
        volumes:
          - postgres_data:/var/lib/postgresql/data
        ports:
          - "5432:5432"

    volumes:
      postgres_data:
    ```
2.  **Start Docker services:**
    ```bash
    docker compose up -d
    ```
    Verify containers are running: `docker ps`

### 3\. Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**

    ```bash
    python3.10 -m venv venv # Use `python -m venv venv` if `python` points to 3.10
    source venv/bin/activate # macOS/Linux
    # For Windows Command Prompt: .\venv\Scripts\activate
    # For Windows PowerShell: .\venv\Scripts\Activate.ps1
    ```

3.  **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

      * If `requirements.txt` does not exist yet (first setup), run:
        ```bash
        pip install fastapi uvicorn "langchain[all]" pydantic sqlalchemy psycopg2-binary passlib[bcrypt] python-jose[cryptography] python-dotenv sentence-transformers chromadb pypdf asyncpg greenlet langchain-google-genai
        pip install "alembic<1.12" # Specific version for compatibility
        pip freeze > requirements.txt # Then create the file
        ```

4.  **Create and configure `.env` file:**
    Create a file named `.env` in your `backend/` directory.

    ```dotenv
    # backend/.env
    DATABASE_URL="postgresql://user:password@localhost:5432/mental_health_db" # Connects to Docker DB via localhost
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_REPLACE_THIS_WITH_A_LONG_RANDOM_STRING" # Generate a strong, random string
    ALGORITHM="HS256"
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE" # Your Gemini API key
    ACCESS_TOKEN_EXPIRE_MINUTES=30 # Set to 1 for faster testing of expiry
    ```

      * **IMPORTANT:** Replace placeholder values with your actual Google Gemini API Key and a strong JWT secret.

5.  **Initialize and run database migrations (Alembic):**

      * Ensure your `backend/` directory is clean (no old `alembic` folder).
      * Initialize Alembic:
        ```bash
        alembic init -t async alembic
        ```
      * **Configure `backend/alembic.ini`**:
          * Uncomment `sqlalchemy.url` and set `sqlalchemy.url = %(DATABASE_URL)s`.
          * Ensure `script_location = alembic`.
      * **Configure `backend/alembic/env.py`**:
          * Add `from dotenv import load_dotenv; load_dotenv()` at the top.
          * Add `from app.config import settings` and `from app.models import Base`.
          * Set `target_metadata = Base.metadata`.
          * In `run_async_migrations()`, set `url=settings.DATABASE_URL` for `async_engine_from_config`.
      * **Generate initial migration:**
        ```bash
        alembic revision --autogenerate -m "Create initial user table"
        ```
      * **Apply all migrations:**
        ```bash
        alembic upgrade head
        ```

### 4\. RAG Knowledge Base Ingestion

You need to prepare your RAG knowledge base for the chatbot.

1.  **Populate `data/` folder:**
      * Place your mental health and self-help documents (PDFs, TXT, MD) into the `mental-health-assistant/data/` directory (create if not there). Focus on reputable sources like NIMH, WHO, HelpGuide.
2.  **Run the ingestion script:**
      * Ensure your Python virtual environment is active and you are in the `backend/` directory.
      * ```bash
          python ingest_data.py
        ```
        This will create `backend/chroma_db/`.

### 5\. Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd ../frontend
    ```

2.  **Install Node.js dependencies:**

      * If `node_modules` does not exist or if you cleaned it (`rm -rf node_modules`), run:
        ```bash
        npm install
        ```
      * Ensure `react-select`, `react-calendar`, `react-markdown`, `rehype-raw`, `@tailwindcss/typography` are installed (npm install should pick them up from package.json).

3.  **Create and configure `.env.local` file:**
    Create a file named `.env.local` in your `frontend/` directory.

    ```dotenv
    # frontend/.env.local
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ```

      * **IMPORTANT:** Add `.env.local` to `frontend/.gitignore` (it should be there by default).

4.  **Verify `postcss.config.js`:**
    Ensure `frontend/postcss.config.js` has the correct plugin for your setup (as per `package.json`).

    ```javascript
    // frontend/postcss.config.js
    module.exports = {
      plugins: {
        '@tailwindcss/postcss': {}, // Use this if @tailwindcss/postcss is in devDependencies
        autoprefixer: {},
      },
    };
    ```

      * **IMPORTANT:** Ensure this file is named `postcss.config.js` (not `.mjs`). If you had `.mjs` before, rename it.

### 6\. Running the Application

1.  **Start the Backend API Server:**

      * In a new terminal tab/window, navigate to `mental-health-assistant/backend/`.
      * Activate `venv`.
      * ```bash
          uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        ```
      * Watch for successful initialization of DB, ChromaDB, and Gemini.

2.  **Start the Frontend Development Server:**

      * In another terminal tab/window, navigate to `mental-health-assistant/frontend/`.
      * ```bash
          npm run dev
        ```

3.  **Access the Application:** Open your web browser and go to `http://localhost:3000`.

## Usage Guide

* **Login/Register:** Start by creating a new account or logging in.

* **Profile Settings:** Access your profile from the top-right dropdown to add personal details, triggers, and areas of focus.

* **Mood Tracker:** Log your daily mood with notes and tags. View your mood history and trends on the Mood page and Insights page.

* **Journal:** Write private journal entries. Markdown formatting is supported. View sentiment analysis results, filter, and search past entries.

* **Chat with AI:** Engage with the AI assistant for self-help advice. Ask questions about mental health or stress management. The AI will use your curated knowledge base and consider your recent mood/journal data for personalized responses.

* **Insights:** Visit the Insights page to see visualizations of your mood patterns and journal sentiment distribution.

* **Resources:** (Placeholder for now) The Resources section will house curated articles and exercises.

## Key Implementation Details & Design Choices

* **Modular Backend:** FastAPI project structured into `app/`, `auth/`, `api/`, `services/` for clear separation of concerns.

* **Asynchronous Operations:** FastAPI and SQLAlchemy are configured for asynchronous (async/await) operations for better performance.

* **Secure Authentication:** JWT-based authentication with bcrypt hashing, managed centrally via AuthContext on the frontend and apiClient interceptors. Robust 401 Unauthorized handling for expired tokens.

* **Database Migrations:** Alembic manages database schema evolution (users, mood_entries, journal_entries, chat_messages, resources, exercises, goals).

* **Retrieval-Augmented Generation (RAG):**
  * **Data Ingestion:** A dedicated `ingest_data.py` script for processing documents into ChromaDB.
  * **LangChain Chains:** ConversationalRetrievalChain orchestrates retrieval from ChromaDB and interaction with Gemini.
  * **Persistent Memory:** Chat history is stored in PostgreSQL, retrieved, and injected into the LLM context for coherent conversations.
  * **Personalization:** User profile data, recent mood trends, and journal summaries are dynamically injected into the LLM prompt, making responses highly relevant.
  * **Safety First:** Crisis keyword detection triggers immediate emergency resource provision.

* **Sentiment Analysis:** `nlp_service.py` uses Gemini to analyze journal entry sentiment, providing Positive, Negative, or Neutral labels and scores, handled with robust JSON parsing.

* **Frontend State Management:** React Context API (AuthContext, ThemeContext) for global state, combined with useState, useEffect, useMemo, useCallback hooks for efficient component logic.

* **Dynamic UI:** Tailwind CSS for styling, react-select for multi-select inputs, recharts for data visualizations, react-calendar for interactive calendar views, and react-markdown for rich text display.

* **Error Handling:** Comprehensive error logging on both frontend (Axios interceptors) and backend (FastAPI exception handling). User-friendly error messages are displayed.

## Ethical Considerations & Disclaimers

* This application is designed as a self-help tool and is **not a substitute for professional medical or psychological advice**.

* **AI Limitations:** The AI assistant is an automated program. It cannot diagnose, treat, or provide therapeutic interventions.

* **Crisis Situations:** For any crisis, emergency, or severe distress, users are always advised to seek immediate professional help from qualified healthcare providers or emergency services. Explicit crisis hotlines are provided within the application.

* **Data Privacy:** While this project for learning stores user data locally (PostgreSQL), in a production environment, robust data privacy (encryption, access controls, compliance with regulations like GDPR/HIPAA) would be paramount due to the sensitive nature of mental health information.

* **Bias:** LLMs can exhibit biases present in their training data. While efforts are made to prompt for neutral and empathetic responses, results may vary.

* **Content Accuracy:** The RAG knowledge base relies on curated, reputable sources, but the AI's interpretation and synthesis are automated processes. Always verify critical information with a professional.

## Future Enhancements / Roadmap

This project has a strong foundation and can be expanded in many exciting ways:

* **Interactive Exercises & Content Library Expansion:**
  * Populate the Resources tab with a comprehensive, categorized library of articles, videos, and tools.
  * Develop more interactive, step-by-step guided exercises (e.g., audio-guided meditations, interactive CBT worksheets).
  * Track exercise completion for user progress.

* **Goal Setting & Tracking:** Allow users to set and monitor specific mental health goals (e.g., "meditate 10 mins daily," "reduce screen time").

* **Gamification & Engagement:**
  * Implement reminders and push notifications for journaling, mood checks, or exercises.
  * Introduce more streaks, badges, or points for consistent engagement and goal achievement.
  * Daily check-in prompts or reflective questions.

* **Advanced Analytics & Insights:**
  * More sophisticated pattern detection in mood/journal data (e.g., "your mood dips on days you miss sleep," correlation analysis).
  * User-defined custom reports.

* **User Feedback & Rating:** Allow users to rate AI responses or resource helpfulness to improve content over time.

* **Multi-modal Input:** Add voice input to the chatbot.

* **Deployment:** Containerize the FastAPI backend and deploy both frontend and backend to a cloud platform (e.g., Render, Vercel, Fly.io, Google Cloud Run).

* **Admin Panel:** Create a simple admin interface for managing resources, exercises, and monitoring user activity (with strict access control).

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository, create a new branch, and submit a pull request. Ensure your code adheres to existing style guides and passes tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.