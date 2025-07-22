# Mental Health & Self-Help Assistant

## Project Overview

This is a personal mental health and self-help assistant designed to provide guided support, resources, mood tracking, and journaling features. It leverages AI (specifically Retrieval-Augmented Generation - RAG) to offer personalized and context-aware advice, while also providing tools for self-reflection and progress tracking.

## Features (Planned)

### Core Chatbot Functionality
* **AI Chatbot:** An intelligent chatbot powered by a Large Language Model (LLM) and a Retrieval-Augmented Generation (RAG) system to provide relevant information and support.
* **Conversational Memory:** The chatbot maintains context throughout conversations.
* **Personalized Responses:** The bot adapts advice based on user profiles, mood, and journal entries.
* **Safety Filters:** Mechanisms to detect and prevent harmful content, and provide crisis resources.

### Self-Help & Tracking Tools
* **Mood Tracking:** Log daily mood (e.g., scale 1-5, emojis).
* **Secure Journaling:** A private space for users to write and reflect on their thoughts and feelings.
* **Progress Visualization:** Graphs and charts to show mood trends and activity completion over time.
* **Interactive Exercises:** Guided breathing, mindfulness, and CBT/DBT-inspired activities.
* **Curated Resource Library:** Access to articles, videos, and external links on various mental health topics.
* **Goal Setting & Tracking:** Set personal well-being goals and track progress.

## Tech Stack

### Backend (Python)
* **Framework:** FastAPI
* **AI/NLP:** LangChain, Ollama (for local LLM), Hugging Face `sentence-transformers` (for embeddings)
* **Database:** PostgreSQL (via Docker)
* **ORM:** SQLAlchemy (with Asyncio)
* **Migrations:** Alembic
* **Authentication:** JWT (using `passlib`, `python-jose`)
* **Environment Management:** `python-dotenv`

### Frontend (React)
* **Framework:** Next.js (with TypeScript)
* **Styling:** Tailwind CSS (or chosen alternative)
* **HTTP Client:** Axios / Fetch API
* **Data Visualization:** Recharts (or chosen alternative)

### Infrastructure / Tools
* **Containerization:** Docker, Docker Compose
* **Version Control:** Git

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* **Python 3.10+:** [Download & Install](https://www.python.org/downloads/) (ensure `Add Python to PATH` is checked)
* **Docker Desktop:** [Download & Install](https://www.docker.com/products/docker-desktop/) (ensure WSL2/Hyper-V is enabled on Windows)
* **Node.js (LTS) & npm:** [Download & Install](https://nodejs.org/en/download/) (or use NVM for flexible version management)
* **VS Code (Recommended IDE):** [Download & Install](https://code.visualstudio.com/)

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/mental-health-assistant.git](https://github.com/your-username/mental-health-assistant.git)
    cd mental-health-assistant
    ```

2.  **Start Docker services (PostgreSQL & Ollama):**
    ```bash
    docker compose up -d
    ```
    Verify containers are running: `docker ps`

3.  **Pull an Ollama LLM model:**
    Find your Ollama container ID/name from `docker ps` (e.g., `mental-health-assistant-ollama-1`).
    ```bash
    docker exec -it <ollama-container-id-or-name> ollama pull mistral
    ```

4.  **Backend Setup:**
    ```bash
    cd backend
    python3.10 -m venv venv # or `python -m venv venv`
    source venv/bin/activate # macOS/Linux (or `.\venv\Scripts\activate` on Windows)

    # Install Python dependencies
    pip install -r requirements.txt # This will be created in the next step

    # Set up .env file (create if it doesn't exist)
    # Ensure DATABASE_URL is set to postgresql://user:password@localhost:5432/mental_health_db
    # JWT_SECRET and ALGORITHM should also be set.

    # Initialize and run database migrations
    alembic upgrade head # This command will apply all pending migrations
    ```

5.  **Frontend Setup:**
    *(To be filled in later, after frontend setup guide)*
    ```bash
    cd ../frontend
    npm install
    # npm run dev
    ```

## Development

*(To be filled in with how to run development servers, testing, etc.)*

## Contributing

*(Guidance for potential contributors - optional for personal project)*

## License

*(e.g., MIT License)*

## Contact

*(Your contact information - optional)*