import fitz  # PyMuPDF
from typing import Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from rag.retriever import client, embeddings

def ingest_private_pdf(pdf_bytes: bytes, filename: str, business_id: str) -> int:
    """
    Extracts text from PDF bytes, chunks the text, computes embeddings, and
    saves the document chunks in the private_kb collection tagged by business_id.
    """
    # 1. Open PDF in memory using fitz stream reader
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()

    if not text.strip():
        raise ValueError("Could not extract any printable text from the uploaded PDF document.")

    # 2. Split the document text into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    if not chunks:
        return 0

    # 3. Connect to the private vector database collection
    collection = client.get_or_create_collection("private_kb")

    # 4. Generate embeddings for all text chunks
    embedded_vectors = embeddings.embed_documents(chunks)

    # 5. Insert records into ChromaDB
    ids = [f"{business_id}_{filename}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "source": filename,
            "business_id": business_id,
            "domain": "private",
            "url": ""
        }
        for _ in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        embeddings=embedded_vectors,
        documents=chunks,
        metadatas=metadatas
    )

    return len(chunks)
