import os
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
    Scans the data/ folder for PDFs, chunks, embeds, and saves them
    into the public_kb ChromaDB collection.
    """
    if not os.path.exists(DATA_DIR):
        print(f"Data directory '{DATA_DIR}' does not exist. Creating it now.")
        os.makedirs(DATA_DIR)
        print("Please place your public PDF files inside this data/ directory and run this script again.")
        return

    google_key = os.getenv("GOOGLE_API_KEY")
    if not google_key:
        print("Error: GOOGLE_API_KEY not found in environment variables. Please check your .env file.")
        return

    print("Initializing Google Generative AI Embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

    print(f"Connecting to ChromaDB client at: {CHROMA_PATH}")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection("public_kb")

    pdf_files = [f for f in os.listdir(DATA_DIR) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"No PDF documents found in data directory: {DATA_DIR}")
        return

    print(f"Found {len(pdf_files)} PDF file(s) to process.")

    for fname in pdf_files:
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

            # Insert into database
            ids = [f"{fname}_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "source": fname,
                    "domain": "public",
                    "url": None
                }
                for _ in range(len(chunks))
            ]

            collection.add(
                ids=ids,
                embeddings=embedded_vectors,
                documents=texts,
                metadatas=metadatas
            )
            print(f"Indexed document '{fname}' successfully.\n")
        except Exception as e:
            print(f"Failed to process document {fname}: {e}\n")

    print(f"Ingestion complete. Total chunks in public_kb collection: {collection.count()}")

if __name__ == "__main__":
    run_ingest()
