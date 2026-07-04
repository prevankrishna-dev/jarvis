import os
import chromadb
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Set dummy key for startup if not provided (prevents initialization crash)
if not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = "mock-google-api-key-for-startup"

from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Initialize embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

# Set up persistent Chroma client relative to this file's folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
client = chromadb.PersistentClient(path=CHROMA_PATH)

def query_kb(
    collection_name: str,
    query: str,
    top_k: int = 3,
    business_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Connects to persistent ChromaDB collection, generates query embeddings,
    and returns matching document chunks with similarity scores.
    """
    try:
        # Get or create collection
        collection = client.get_or_create_collection(collection_name)
    except Exception as e:
        print(f"Error accessing collection '{collection_name}': {e}")
        return []

    if collection.count() == 0:
        return []

    # Embed query
    try:
        query_vector = embeddings.embed_query(query)
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

    # Add business_id filter for private database if specified
    where_filter = None
    if collection_name == "private_kb" and business_id:
        where_filter = {"business_id": business_id}

    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
        where=where_filter
    )

    chunks = []
    if results and "documents" in results and results["documents"]:
        documents = results["documents"][0]
        metadatas = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else []
        distances = results["distances"][0] if "distances" in results and results["distances"] else []

        for i in range(len(documents)):
            # Convert L2 distance to similarity score in [0, 1] range
            # Chroma default metric is L2 squared, dist = ||u-v||^2, which can go from 0 to 2+ for normal vectors.
            # Convert to similarity score: similarity = 1 - (dist / 2.0)
            dist = distances[i] if i < len(distances) else 1.0
            similarity = max(0.0, min(1.0, 1.0 - (dist / 2.0)))

            meta = metadatas[i] if i < len(metadatas) else {}
            chunks.append({
                "text": documents[i],
                "source": meta.get("source", "Unknown Document"),
                "url": meta.get("url", None),
                "score": similarity
            })

    return chunks
