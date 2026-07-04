import os
from urllib.parse import urlparse
from typing import List, Dict, Any
from langchain_community.tools.tavily_search import TavilySearchResults

def search_live(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Executes a web search via Tavily, returning results in a standard
    format compatible with the ChromaDB retriever results.
    """
    if not os.getenv("TAVILY_API_KEY"):
        print("Warning: TAVILY_API_KEY not set. Live search will return empty list.")
        return []

    try:
        # Initialize search tool
        search_tool = TavilySearchResults(max_results=max_results)
        
        # Invoke search tool
        raw_results = search_tool.invoke(query)
        
        formatted_results = []
        # TavilySearchResults returns a list of dictionaries with 'url' and 'content'
        for res in raw_results:
            url = res.get("url", "")
            content = res.get("content", "")
            
            # Extract domain for clean source display
            source_name = "Tavily Live Web"
            if url:
                try:
                    parsed = urlparse(url)
                    if parsed.netloc:
                        source_name = f"Live Search: {parsed.netloc}"
                except Exception:
                    pass
            
            formatted_results.append({
                "text": content,
                "source": source_name,
                "url": url,
                "score": 0.85  # Default confidence score for fresh web search results
            })
            
        return formatted_results
    except Exception as e:
        print(f"Error during Tavily Search execution: {e}")
        return []
