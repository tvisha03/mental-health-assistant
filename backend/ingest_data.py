import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma

# Load environment variables (not strictly needed for this script, but good practice)
load_dotenv()

# --- Configuration ---
# Path to your documents (relative to backend/ folder)
DATA_PATH = "../data"
# Directory where ChromaDB's persistent data will be stored (relative to backend/ folder)
CHROMA_PERSIST_DIRECTORY = "./chroma_db"
# Name of the embedding model to use (needs `sentence-transformers` installed)
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
# --- End Configuration ---


def run_ingestion():
    print("Starting document ingestion...")

    # 1. Load Documents from the 'data' directory
    print(f"Attempting to load documents from: {DATA_PATH}")
    all_docs = []

    # Load Text and Markdown files using TextLoader
    try:
        text_loader = DirectoryLoader(
            DATA_PATH,
            glob="**/*.txt",  # Matches .txt files
            loader_cls=TextLoader,
            loader_kwargs={'autodetect_encoding': True} # Helps with various encodings
        )
        md_loader = DirectoryLoader(
            DATA_PATH,
            glob="**/*.md",   # Matches .md (Markdown) files
            loader_cls=TextLoader,
            loader_kwargs={'autodetect_encoding': True}
        )
        all_docs.extend(text_loader.load())
        all_docs.extend(md_loader.load())
        print(f"Loaded {len(all_docs)} text/markdown documents so far.")
    except Exception as e:
        print(f"Warning: Could not load text/markdown files. Error: {e}")

    # Load PDF files using PyPDFLoader
    try:
        pdf_loader = DirectoryLoader(
            DATA_PATH,
            glob="**/*.pdf",  # Matches .pdf files
            loader_cls=PyPDFLoader
        )
        all_docs.extend(pdf_loader.load())
        print(f"Loaded a total of {len(all_docs)} documents including PDFs.")
    except Exception as e:
        print(f"Warning: Could not load PDF files. Ensure 'pypdf' is installed. Error: {e}")
        # Ensure pypdf is installed: pip install pypdf

    if not all_docs:
        print("No documents loaded. Please check your data/ directory and file types (.txt, .md, .pdf).")
        return

    # 2. Split Documents into Chunks
    print(f"Splitting {len(all_docs)} documents into smaller chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,      # Max characters in each chunk
        chunk_overlap=200,    # Overlap between chunks to maintain context
        length_function=len,  # Use character length for chunking
        is_separator_regex=False, # Not using regex for separators
    )
    chunks = text_splitter.split_documents(all_docs)
    print(f"Split into {len(chunks)} chunks.")

    # 3. Create Embeddings
    print(f"Initializing embedding model: {EMBEDDING_MODEL_NAME}...")
    # Ensure 'sentence-transformers' is installed in your venv: pip install sentence-transformers
    embeddings = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL_NAME)

    # 4. Store in ChromaDB
    print(f"Storing embeddings and chunks in ChromaDB at: {CHROMA_PERSIST_DIRECTORY}")

    # Ensure the directory exists
    os.makedirs(CHROMA_PERSIST_DIRECTORY, exist_ok=True)

    # Initialize Chroma vector store with persistence
    # This will create new data or load existing data if the directory is not empty
    db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PERSIST_DIRECTORY
    )
    db.persist() # Explicitly persist changes to disk
    print("Document ingestion complete! ChromaDB updated.")

if __name__ == "__main__":
    run_ingestion()