from pydantic import BaseModel, Field
from typing import List, Optional

class Source(BaseModel):
    name: str = Field(..., description="The name of the retrieved document or web search citation")
    excerpt: str = Field(..., description="A short textual snippet from the source")
    url: Optional[str] = Field(None, description="The URL of the source page, or None if private document")
    score: float = Field(..., description="Retrieval similarity score")

class MessageParam(BaseModel):
    role: str = Field(..., description="The sender role, either 'user' or 'assistant'")
    content: str = Field(..., description="The content of the message")

class ChatRequest(BaseModel):
    query: str = Field(..., description="The question query from the user")
    business_id: str = Field(..., description="The business ID context for private knowledge base filtering")
    threshold: float = Field(0.5, description="Similarity score threshold cutoff")
    history: Optional[List[MessageParam]] = Field(default=[], description="List of prior messages in the conversation")

class ChatResponse(BaseModel):
    answer: str = Field(..., description="The context-grounded answer or refusal message")
    sources: List[Source] = Field(default=[], description="List of retrieved source citations used to build the answer")
    confidence: str = Field(..., description="Confidence rating based on matching similarity scores ('high' | 'medium' | 'low')")

class UploadResponse(BaseModel):
    filename: str = Field(..., description="Name of the successfully uploaded and indexed file")
    status: str = Field("success", description="Status code")
    message: str = Field(..., description="Detailed index confirmation message")

class HealthResponse(BaseModel):
    status: str = Field("ok", description="FastAPI server status indicator")
