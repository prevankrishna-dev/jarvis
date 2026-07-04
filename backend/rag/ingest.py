import os
import sys
import time
import chromadb
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv()

# Define absolute paths relative to backend root
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
CHROMA_PATH = os.path.join(BACKEND_DIR, "chroma_db")

def run_ingest():
    """
    Scans the data/ folder for actual PDF documents, checks if they are already ingested,
    and ingests any new/missing documents into the private knowledge base.
    """
    if not os.path.exists(DATA_DIR):
        print(f"Data directory '{DATA_DIR}' does not exist. Creating it now.")
        os.makedirs(DATA_DIR)
        print("Please place your PDF files inside the data/ directory and run this script again.")
        return

    google_key = os.getenv("GOOGLE_API_KEY")
    if not google_key:
        print("Error: GOOGLE_API_KEY not found in environment variables. Please check your .env file.")
        return

    print("Initializing Google Generative AI Embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

    print(f"Connecting to ChromaDB client at: {CHROMA_PATH}")
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    # Optional complete reset
    reset_db = "--reset" in sys.argv
    if reset_db:
        print("Reset flag detected. Deleting existing collections...")
        for name in ["public_kb", "private_kb"]:
            try:
                client.delete_collection(name)
                print(f"Deleted existing collection: {name}")
            except Exception as e:
                print(f"Collection '{name}' did not exist or could not be deleted: {e}")

    # Recreate or get the collections
    public_col = client.get_or_create_collection("public_kb")
    private_col = client.get_or_create_collection("private_kb")

    pdf_files = [f for f in os.listdir(DATA_DIR) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"No PDF documents found in data directory: {DATA_DIR}")
        return

    print(f"Found {len(pdf_files)} PDF file(s) in data directory.")

    # Business IDs to associate private documents with
    business_ids = ["default_business", "biz_123"]

    for fname in pdf_files:
        # Check if already processed to save API quota
        try:
            existing = private_col.get(
                where={"source": fname},
                limit=1
            )
            if existing and existing["ids"]:
                print(f"Document '{fname}' is already indexed. Skipping.")
                continue
        except Exception as e:
            print(f"Error checking existing status for '{fname}': {e}")

        file_path = os.path.join(DATA_DIR, fname)
        print(f"Loading document: {fname}...")
        try:
            loader = PyMuPDFLoader(file_path)
            docs = loader.load()
            
            chunks = splitter.split_documents(docs)
            print(f"Created {len(chunks)} text chunks. Generating vector embeddings...")

            texts = [chunk.page_content for chunk in chunks]
            if not texts:
                print(f"Warning: No text content found in {fname}.")
                continue

            # Compute embeddings in a single batch
            embedded_vectors = embeddings.embed_documents(texts)

            # Ingest into private database for each associated business_id
            for biz_id in business_ids:
                ids = [f"private_{biz_id}_{fname}_{i}" for i in range(len(chunks))]
                metadatas = [
                    {
                        "source": fname,
                        "business_id": biz_id,
                        "domain": "private",
                        "url": ""
                    }
                    for _ in range(len(chunks))
                ]

                private_col.add(
                    ids=ids,
                    embeddings=embedded_vectors,
                    documents=texts,
                    metadatas=metadatas
                )
            print(f"Indexed document '{fname}' successfully for business IDs: {business_ids}.\n")
            
            # Sleep briefly to avoid hitting rate limits on the Gemini API
            time.sleep(1.5)
            
        except Exception as e:
            print(f"Failed to process document {fname}: {e}\n")

    print(f"Ingestion complete.")
    print(f"Total chunks in public_kb collection: {public_col.count()}")
    print(f"Total chunks in private_kb collection: {private_col.count()}")

if __name__ == "__main__":
    run_ingest()
