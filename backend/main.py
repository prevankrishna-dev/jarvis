import os
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables on startup
load_dotenv()

from models import ChatRequest, ChatResponse, UploadResponse, HealthResponse
from rag.chain import get_answer
from rag.ingest_private import ingest_private_pdf

app = FastAPI(
    title="Jarvis BI Assistant Backend",
    description="Vector Search & Web Search RAG pipeline with FastAPI and LangChain",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Returns server status. Used to verify backend uptime during demos.
    """
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """
    Receives query and business context, runs retrieval and threshold filtering,
    and returns context-grounded response.
    """
    try:
        ans = get_answer(
            query=request.query,
            business_id=request.business_id,
            threshold=request.threshold
        )
        return ans
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred in RAG pipeline execution: {str(e)}"
        )

@app.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    business_id: str = Form(...)
):
    """
    Receives a PDF document, extracts text using PyMuPDF, chunks, embeds,
    and inserts it into the private vector database.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Jarvis only supports indexing PDF files currently."
        )

    try:
        # Read raw file stream
        pdf_bytes = await file.read()
        
        # Run text extraction and private ingestion
        num_chunks = ingest_private_pdf(
            pdf_bytes=pdf_bytes,
            filename=file.filename,
            business_id=business_id
        )
        
        return {
            "filename": file.filename,
            "status": "success",
            "message": f"Indexed {num_chunks} vector chunks to private knowledge base."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed for file '{file.filename}': {str(e)}"
        )
