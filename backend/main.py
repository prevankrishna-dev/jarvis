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

@app.get("/files")
async def list_files():
    """
    Scans backend/data/ directory, formats file sizes,
    and groups files by category/folder dynamically.
    """
    # Define directories shape
    folders = {
        "public": {"id": "public", "name": "public", "files": []},
        "confidential": {"id": "confidential", "name": "confidential", "files": []},
        "revenue": {"id": "revenue", "name": "revenue", "files": []},
        "certificates": {"id": "certificates", "name": "certificates", "files": []},
        "invoices": {"id": "invoices", "name": "invoices", "files": []},
        "approval": {"id": "approval", "name": "approval documents", "files": []},
        "credit": {"id": "credit", "name": "credit docs", "files": []},
    }
    
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(backend_dir, "data")
    
    if not os.path.exists(data_dir):
        return list(folders.values())
        
    def get_folder_id(filename: str) -> str:
        fn = filename.lower()
        if "invoice" in fn:
            return "invoices"
        elif "revenue" in fn or "annual_report" in fn or "turnover" in fn:
            return "revenue"
        elif "certificate" in fn or "incorporation" in fn or "udyam" in fn or "registration" in fn:
            return "certificates"
        elif "confidential" in fn or "agreement" in fn or "employment" in fn or "business_plan" in fn:
            return "confidential"
        elif "cgtmse" in fn or "mudra" in fn or "loan" in fn or "sidbi" in fn:
            return "credit"
        elif "noc" in fn or "resolution" in fn or "approval" in fn:
            return "approval"
        else:
            return "public"
            
    try:
        pdf_files = sorted([f for f in os.listdir(data_dir) if f.lower().endswith(".pdf")])
        for fname in pdf_files:
            filepath = os.path.join(data_dir, fname)
            try:
                size_bytes = os.path.getsize(filepath)
                if size_bytes >= 1024 * 1024:
                    size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
                else:
                    size_str = f"{size_bytes / 1024:.0f} KB"
            except Exception:
                size_str = "Unknown size"
                
            folder_id = get_folder_id(fname)
            folders[folder_id]["files"].append({
                "name": fname,
                "size": size_str
            })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scan files: {str(e)}"
        )
            
    return list(folders.values())
