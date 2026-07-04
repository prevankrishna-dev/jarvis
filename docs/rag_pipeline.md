# Jarvis RAG Pipeline Documentation

The core of Jarvis's intelligence is its hybrid Retrieval-Augmented Generation (RAG) pipeline managed under the `backend/rag/` package. 

---

## 1. Orchestration Engine (`rag/chain.py`)

The main entrypoint is the `get_answer(query, business_id, threshold)` function. It executes three parallel retrieval steps:

1. **Public Vector Retrieval**: Queries `public_kb` in ChromaDB for matching government scheme chunks.
2. **Private Vector Retrieval**: Queries `private_kb` in ChromaDB, filtered by `where={"business_id": business_id}`.
3. **Live Search**: Pulls relevant search results from Tavily.

### Similarity Score Thresholding

Jarvis evaluates the similarity scores of all retrieved hits to categorize the confidence level:
- **High Confidence (`score > 0.75`)**: Context is extremely relevant. The LLM generates the answer normally.
- **Medium Confidence (`0.50 <= score <= 0.75`)**: Context is somewhat relevant. The LLM generates the answer, and the engine appends a safety verification disclaimer.
- **Low Confidence (`score < 0.50` or empty results)**: Context is weak. The engine returns a pre-defined refusal message directly and **skips LLM generation** entirely to guarantee zero hallucination.

---

## 2. Local Persistent Vector Store (`rag/retriever.py`)

- **Database**: Local ChromaDB instance operating via `chromadb.PersistentClient(path="./chroma_db")`.
- **Embeddings**: LangChain `GoogleGenerativeAIEmbeddings` using `models/text-embedding-004` (768-dimension vectors).
- **Distance to Similarity Conversion**: ChromaDB uses squared L2 distance by default. The retriever converts these distances to similarity scores:
  $$\text{similarity} = \max\left(0.0, \min\left(1.0, 1.0 - \frac{\text{distance}}{2.0}\right)\right)$$

---

## 3. In-Memory PDF Parser (`rag/ingest_private.py`)

When a user drops a file, it is processed entirely in memory without writing temp files to disk:
- **Text Extraction**: PyMuPDF (`fitz`) opens the bytes stream directly:
  ```python
  doc = fitz.open(stream=pdf_bytes, filetype="pdf")
  text = "".join(page.get_text() for page in doc)
  ```
- **Chunking**: `RecursiveCharacterTextSplitter` splits the text:
  ```python
  splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
  chunks = splitter.split_text(text)
  ```
- **Batch Insertion**: Computes embeddings in a single batch (`embed_documents()`) and inserts them into `private_kb` with `business_id` and file metadata tagging.

---

## 4. Standalone Public Ingestion (`rag/ingest.py`)

- **Purpose**: Pre-populates the vector index from government guidelines.
- **Flow**: Walks `backend/data/*.pdf`, loads text using `PyMuPDFLoader`, chunks, generates batch embeddings, and saves them to the `public_kb` ChromaDB collection.
- **Usage**: Run manually from the `backend/` folder:
  ```bash
  python -m rag.ingest
  ```

---

## 5. Live Search Engine (`rag/tavily_search.py`)

- **Tool**: LangChain `TavilySearchResults` wrapper.
- **Formatting**: Extracts the hostname from URLs to assign clean source names (e.g. `Live Search: startupindia.gov.in`).
- **Confidence**: Returns results with a default score of `0.85` as fresh web search context.
