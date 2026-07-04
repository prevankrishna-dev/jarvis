import os
from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from rag.prompts import SYSTEM_PROMPT
from rag.retriever import query_kb
from rag.tavily_search import search_live

def get_answer(query: str, business_id: str, threshold: float = 0.50) -> Dict[str, Any]:
    """
    Orchestrates the hybrid RAG query pipeline:
    1. Retrieves context chunks from public_kb and private_kb (filtered by business_id).
    2. Performs live search via Tavily.
    3. Merges results and calculates the highest matching similarity score.
    4. Evaluates against the confidence threshold logic.
    5. Feeds context to Gemini 1.5 Flash to generate a grounded response.
    """
    # 1. Retrieve chunks from public vector database
    public_chunks = query_kb(collection_name="public_kb", query=query, top_k=3)

    # 2. Retrieve chunks from private vector database (scoped to business_id)
    private_chunks = query_kb(collection_name="private_kb", query=query, top_k=3, business_id=business_id)

    # 3. Retrieve live web results via Tavily
    live_chunks = search_live(query=query, max_results=3)

    # 4. Merge all retrieved context chunks
    all_chunks = public_chunks + private_chunks + live_chunks

    # Compute best similarity score
    best_score = max([chunk["score"] for chunk in all_chunks], default=0.0)

    # 5. Evaluate confidence thresholding logic
    if best_score < 0.50 or not all_chunks:
        # Refusal path
        return {
            "answer": "I could not retrieve highly confident context to answer this query. Please check the official source directly.",
            "sources": [],
            "confidence": "low"
        }

    confidence = "high" if best_score > 0.75 else "medium"

    # Sort sources by similarity score descending and limit to top 5
    sorted_chunks = sorted(all_chunks, key=lambda x: x["score"], reverse=True)[:5]

    # Format the context block for the system prompt
    context_blocks = []
    for chunk in sorted_chunks:
        context_blocks.append(f"Source: {chunk['source']}\nContent: {chunk['text']}")
    context_text = "\n\n---\n\n".join(context_blocks)

    # Build system and human messages
    system_content = SYSTEM_PROMPT.format(context=context_text)
    messages = [
        SystemMessage(content=system_content),
        HumanMessage(content=query)
    ]

    try:
        # Initialize Gemini 2.5 Flash client
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.0)
        response = llm.invoke(messages)
        answer = response.content
    except Exception as e:
        print(f"Gemini LLM generation error: {e}")
        # Graceful fallback on LLM failure
        return {
            "answer": f"An error occurred while generating the answer from retrieved context. (Detail: {e})",
            "sources": [
                {
                    "name": chunk["source"],
                    "excerpt": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                    "url": chunk["url"],
                    "score": chunk["score"]
                }
                for chunk in sorted_chunks
            ],
            "confidence": "low"
        }

    # Add disclaimer warning for medium confidence scores
    if confidence == "medium":
        answer += "\n\n⚠️ **Disclaimer**: Please verify this information with the official source before making business decisions."

    # Format citations matching Pydantic Model shape
    sources_response = [
        {
            "name": chunk["source"],
            "excerpt": chunk["text"],
            "url": chunk["url"],
            "score": chunk["score"]
        }
        for chunk in sorted_chunks
    ]

    return {
        "answer": answer,
        "sources": sources_response,
        "confidence": confidence
    }
