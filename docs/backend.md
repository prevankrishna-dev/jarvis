# Jarvis FastAPI Backend Documentation

The backend service is built with **FastAPI** and hosted via **Uvicorn** on port `8000`. It acts as the API gateway, receiving queries and uploads from the frontend, parsing inputs, and calling python-native RAG libraries.

---

## 1. Directory Structure

```
backend/
├── main.py                # FastAPI endpoints and middleware config
├── models.py              # Pydantic schemas mapping request/responses
├── requirements.txt       # Dependencies pin list
└── rag/                   # Underlying vector storage and LLM retrieval logic
```

---

## 2. API Endpoints

### A. Health check (`/health` - `GET`)
- **Purpose**: Uptime validation.
- **Response Shape**:
  ```json
  { "status": "ok" }
  ```

### B. Chat query (`/chat` - `POST`)
- **Purpose**: Runs semantic query retrieval and Gemini LLM answers synthesis.
- **Request payload**:
  ```json
  {
    "query": "Is my business eligible for Startup India DPIIT?",
    "business_id": "startup_default_id",
    "threshold": 0.50
  }
  ```
- **Response payload**:
  ```json
  {
    "answer": "Yes, you are eligible...",
    "sources": [
      {
        "name": "Startup_India_DPIIT_Guidelines.pdf",
        "excerpt": "DPIIT recognition is open...",
        "url": "https://www.startupindia.gov.in/...",
        "score": 0.88
      }
    ],
    "confidence": "high"
  }
  ```

### C. Document uploader (`/upload` - `POST`)
- **Purpose**: Accepts a multipart form file and embeds it into the private vector space.
- **Form Fields**:
  - `file`: `UploadFile` (Required, PDF only)
  - `business_id`: `Form(str)` (Required context ID)
- **Response Shape**:
  ```json
  {
    "filename": "sample_agreement.pdf",
    "status": "success",
    "message": "Indexed 8 vector chunks to private knowledge base."
  }
  ```

---

## 3. Core Features

### CORS Middleware Configuration
To prevent browser security blocks during frontend execution, CORS is explicitly configured in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation & Error Handling
- **File Validation**: In `/upload`, the server checks file extensions and raises a `400 Bad Request` if the file is not a PDF.
- **Ingestion Failures**: If text extraction or database ingestion raises an exception, the server returns a `500 Internal Server Error` with detailed error logs.
- **Graceful Fallbacks**: RAG pipeline errors (e.g., Google API timeouts or search rate limits) are caught in `chain.py` and returned as a low-confidence response message rather than crashing the HTTP worker process.
