# Page 1

JARVIS 
Your AI-Powered Business Intelligence Assistant 
Vynedam Talent Hunt 2K26  ·  Malla Reddy University, Hyderabad 
36-Hour National Hackathon  ·  Domain: AI & Machine Learning / GenAI 
Team Document — Architecture · Problem Statement · 36-Hour Roadmap

---

# Page 2

1. Problem Statement 
1.1 The Real-World Problem 
Every business — whether it is a first-time startup founder, a growing agency, a law firm managing contracts, a real 
estate company tracking regulations, or an established SMB navigating compliance — drowns in the same problem: 
critical knowledge is scattered, buried in documents, written in complex language, and constantly changing. 
 
On any given day, a business owner needs answers to questions like: 
• Which government schemes or funding programs am I eligible for right now? 
• What compliance deadlines am I approaching this month — GST, MCA, labour law, sector-specific? 
• I just received a 40-page agreement. Are there any risky clauses or loopholes? 
• Who are my top three competitors and what are they doing differently? 
• My team uploaded a new business plan. Does it conflict with our existing investor agreements? 
• What loan or credit programs match my current business profile and financials? 
 
These questions cut across every industry, every business size, every stage. The answers exist — in PDFs, in government 
portals, in your own uploaded documents — but finding them fast, accurately, and in context is what no existing tool 
does well. 
1.2 Why Existing Tools Fail 
Tool What It Lacks 
ChatGPT / Gemini (general) No memory of your business documents across sessions. 
Context degrades over a long conversation. Cannot cite live, 
current sources. Generic answers for generic questions. 
Search engines Returns 10 blue links. Does not synthesize an answer. Cannot 
reason across your private documents and public data 
simultaneously. 
Consultants / advisors Expensive, slow, unavailable at 11pm. Cannot scale to 
answer 50 questions a week across a growing document 
library. 
Domain-specific SaaS tools Built for one vertical only. A compliance tool does not help 
with contract review. A research tool does not know your 
internal financials. 
Document management systems Store and organize documents but do not answer questions. 
No intelligence layer on top of the stored content. 
1.3 Our Solution — Jarvis 
Jarvis is a RAG-powered (Retrieval-Augmented Generation) AI assistant built for any business that generates, receives, 
and depends on documents and knowledge. It combines two persistent knowledge layers: 
• Public Knowledge Base — Live-fetched and pre-indexed external data — government schemes, regulatory 
updates, compliance deadlines, industry news, market intelligence — always current, always cited. 
• Private Knowledge Base — The business's own documents — agreements, financials, business plans, registration 
certificates, HR policies, client proposals — indexed once, queryable forever, never re-uploaded. 
 
The user asks a question in plain language. Jarvis retrieves the most relevant chunks from both layers simultaneously, 
generates a precise grounded answer, and always shows which source it pulled from. No hallucination. No guessing. No 
losing context after 10 messages.

---

# Page 3

The initial launch targets MSMEs and startups — businesses with the highest document complexity and the least access 
to expensive advisory support. But the architecture is domain-agnostic: the same pipeline serves law firms reviewing 
contracts, agencies managing client briefs, real estate companies tracking regulations, or any knowledge-intensive 
operation. 
1.4 Why RAG — Not Just ChatGPT 
This is the question judges WILL ask. Know this answer cold. 
 
Factor ChatGPT with Upload Jarvis (RAG) 
Document persistence Lost when conversation ends Permanently indexed — survives across 
all sessions 
Growing document library Re-upload everything each time Add new docs anytime; old ones stay 
indexed 
Multi-user / multi-business One user, one context window Separate private knowledge base per 
business 
Live external data Static training cutoff Tavily fetches live regulatory and 
market data at query time 
Source citations Inconsistent, sometimes fabricated Every answer cites exact source chunk 
and URL 
Confidence control Will guess confidently when uncertain Refuses to answer below confidence 
threshold; directs to source 
Scale Breaks down beyond ~50 pages Vector index scales to thousands of 
documents with no performance loss 
1.5 Who Jarvis Serves 
Jarvis is designed for any business that is knowledge-heavy and document-driven. The architecture adapts to the 
domain — only the knowledge base changes: 
Business Type Public KB Private KB Example Query 
MSME / Startup Gov schemes, loan 
programs, compliance rules 
Udyam cert, GST docs, 
business plan 
Am I eligible for Startup India 
tax exemption? 
Law Firm Case law, regulatory 
updates, bar council rules 
Client agreements, internal 
memos, precedents 
Does clause 7.3 of this NDA 
conflict with our standard 
template? 
Agency / Freelancer Industry benchmarks, tax 
rules for services 
Client proposals, SOWs, 
invoices 
Which of my active contracts 
has a payment clause past 
60 days? 
Real Estate Company RERA regulations, zoning 
laws, stamp duty rates 
Property agreements, buyer 
KYC, NOCs 
What RERA disclosures are 
required for this project in 
Telangana? 
Manufacturing SMB BIS standards, export/import 
rules, GST rates 
Purchase orders, quality 
reports, supplier contracts 
Which of our supplier 
contracts expire in the next 
90 days?

---

# Page 4

2. System Architecture 
2.1 The Big Picture 
Before looking at individual components, understand the overall flow. This is what happens every single time a user 
asks Jarvis a question: 
 
User asks question → LangChain decides what to retrieve → ChromaDB (private docs + pre-indexed public KB) searched 
simultaneously with Tavily (live web) → Top results merged → Gemini Flash generates grounded answer with citations → 
User sees answer + source chunks with confidence indicators 
2.2 Architecture Diagram 
┌─────────────────────────────────────────────────────────────┐  
│                     NEXT.JS FRONTEND                        │  
│   Chat UI  ·  Document Upload  ·  Source Citation Cards     │  
└────────────────────────────┬────────────────────────────────┘  
                             │ HTTP (REST) 
┌────────────────────────────▼────────────────────────────────┐  
│                    FASTAPI BACKEND                          │  
│    /chat endpoint  ·  /upload endpoint  ·  /health          │  
└────────────────────────────┬────────────────────────────────┘  
                             │ 
┌────────────────────────────▼────────────────────────────────┐  
│               LANGCHAIN ORCHESTRATION LAYER                 │ 
│                                                              │  
│  ┌──────────────────────┐     ┌───────────────────────────┐ │  
│  │  ChromaDB (Local)    │     │  Tavily Web Search        │ │  
│  │                      │     │  Live fetch — regulations, │ │ 
│  │  Collection 1:       │     │  news, market data,       │ │  
│  │  public_kb           │     │  current schemes          │ │  
│  │  (pre-indexed docs)  │     └───────────────────────────┘ │  
│  │                      │                                    │ 
│  │  Collection 2:       │     ┌───────────────────────────┐ │  
│  │  private_kb          │     │  Gemini Embeddings        │ │  
│  │  (business's own     │     │  text-embedding-004       │ │ 
│  │  uploaded documents) │     └───────────────────────────┘ │  
│  └──────────────────────┘                                    │  
│                              ┌───────────────────────────┐   │  
│                              │  Gemini 1.5 Flash (LLM)  │   │ 
│                              │  Answer generation        │   │  
│                              │  Strict grounding prompt  │   │  
│                              └───────────────────────────┘   │  
└────────────────────────────────────────────────────────── ────┘ 
2.3 Component Breakdown 
Frontend — Next.js + Tailwind CSS 
• Chat interface — user types questions in plain language, sees structured answers 
• Document upload panel — drag and drop any PDF; Jarvis indexes it into the private knowledge base 
• Source citation cards — every answer shows the source document name, excerpt, and URL it retrieved from 
• Confidence indicator — visual signal showing how confident the retrieval was for this answer 
Build the entire frontend BEFORE the hackathon. Do not spend hackathon hours on UI.

---

# Page 5

Backend — FastAPI (Python) 
• /chat — receives user message + business context, calls LangChain pipeline, returns answer + sources 
• /upload — receives PDF, calls PyMuPDF to extract text, chunks and embeds it, stores in private_kb collection 
• /health — simple ping endpoint to confirm the server is alive during demo 
FastAPI is chosen because every RAG tool in the stack — LangChain, ChromaDB, PyMuPDF — is Python-native. Do not 
attempt this in Node.js. 
LangChain — The Orchestration Brain 
LangChain is the coordinator. It takes a user question, runs retrieval against ChromaDB and Tavily simultaneously, 
merges the results, constructs a prompt, calls Gemini Flash, and returns a structured response. You do not need to 
understand every part of LangChain. You need three things: a retriever, a chain, and a prompt template. 
ChromaDB — Local Vector Store 
A vector database stores documents as mathematical representations (embeddings) that capture semantic meaning. 
When you search, it finds documents semantically similar to your question — not just keyword matches. Two 
collections: 
• public_kb — pre-indexed regulatory, compliance, scheme, and market documents 
• private_kb — the specific business's uploaded documents, scoped per user/business 
Pre-build and commit the public_kb ChromaDB collection before the hackathon. Never do ingestion during the 36 hours. 
Tavily — Live Web Intelligence 
Tavily is a search API built specifically for AI consumption. When the user asks about something potentially more 
current than pre-indexed data, Tavily fetches live results from the web and returns clean text ready for the LLM. Free 
tier is 1000 searches/month — sufficient for demo and early usage. 
from langchain_community.tools.tavily_search import TavilySearchResults 
search = TavilySearchResults(max_results=5)  # one import, done  
Gemini Embeddings + Gemini Flash 
• Gemini text-embedding-004 — converts document chunks and user queries into vectors for semantic search 
• Gemini 1.5 Flash — fast, free-tier LLM that generates the final grounded answer 
• One Google AI Studio account, one API key — covers both. No extra billing setup. 
PyMuPDF — Document Parser 
When a user uploads any PDF — an agreement, a registration certificate, a business plan, a financial report — PyMuPDF 
extracts the clean text in three lines of code so it can be chunked and embedded into the private knowledge base. 
2.4 The Hybrid Retrieval Strategy — Your Key Differentiator 
Most RAG demos use one knowledge source. Jarvis uses three simultaneously per query: 
Source Type Covers When Queried 
ChromaDB — public_kb Pre-indexed Regulations, schemes, 
compliance rules, industry 
standards 
Always — first pass 
ChromaDB — private_kb User-uploaded Business's own agreements, 
financials, certificates, plans 
When question is about their 
specific situation 
Tavily Web Search Live fetch Breaking regulatory changes, 
current news, real-time 
market data 
When pre-indexed data may 
be outdated 
2.5 Confidence Thresholding — Responsible AI by Design 
Every retrieved chunk from ChromaDB has a similarity score between 0 and 1. Jarvis uses this to control answer quality:

---

# Page 6

Similarity Score Jarvis Behaviour 
Above 0.75 Answers confidently with source citation 
0.50 to 0.75 Answers with disclaimer: 'Please verify this with the official 
source' 
Below 0.50 Refuses to answer: 'I could not find a confident answer. 
Please check [official URL] directly' 
Frame this as a feature in your pitch: 'Jarvis refuses to guess. It only answers when it has a reliable source. That is what 
makes it trustworthy for business decisions.'

---

# Page 7

3. Final Tech Stack 
Layer Tool Why This Choice 
Frontend Next.js 14 + Tailwind CSS Team already knows it. Build before 
hackathon. Fast to iterate. 
Backend FastAPI (Python) Native to all RAG tooling. Minimal 
boilerplate. Fast to set up. 
Orchestration LangChain Best documentation, largest 
community, easiest to debug at 3am. 
LLM Gemini 1.5 Flash Free tier, fast response, same API 
ecosystem as embeddings. 
Embeddings Gemini text-embedding-004 Same API key as LLM. No extra account 
or billing needed. 
Vector Store ChromaDB (local) Zero setup. One pip install. No 
accounts, no rate limits, no config. 
Live Search Tavily API Built for AI. LangChain native 
integration. Free tier is enough. 
PDF Parsing PyMuPDF Handles any PDF format cleanly. Three 
lines of code to extract text. 
Agent Layer System prompt only Sufficient for 36-hour demo scope. Full 
agent is post-hackathon roadmap.

---

# Page 8

4. Pre-Hackathon Preparation 
Everything in this section must be completed BEFORE you arrive at the venue. Skipping any of this costs you 8-10 hours of 
your 36. 
4.1 Accounts & API Keys — Do This Today 
• Google AI Studio — aistudio.google.com — create account, generate API key (covers Gemini Flash + Embeddings 
both) 
• Tavily — tavily.com — create free account, generate API key 
• GitHub — Create a shared private repo, add all three teammates as collaborators 
Store all API keys in a .env file at project root. Add .env to .gitignore immediately. Never commit keys to GitHub. 
4.2 Environment Setup — All Team Members 
Python (RAG pipeline + backend person): 
pip install langchain langchain-google-genai langchain-community 
pip install chromadb pymupdf tavily-python fastapi uvicorn python-multipart 
Node (frontend person): 
npx create-next-app@latest jarvis-ui --typescript --tailwind 
4.3 Knowledge Base Document List 
Download 20-30 documents total. This is enough for meaningful retrieval without making ingestion a full-day project. 
Organize in a /data folder: 
 
Government & Regulatory (for MSME/startup demo scenario): 
• PM Vishwakarma Scheme — pmvishwakarma.gov.in — full scheme guidelines PDF 
• MUDRA Loan Schemes — mudra.org.in — Shishu, Kishore, Tarun tier details 
• CGTMSE Credit Guarantee — cgtmse.in — credit guarantee scheme documentation 
• Startup India / DPIIT Recognition — startupindia.gov.in — eligibility, tax exemptions, recognition process 
• GST Compliance Calendar — gst.gov.in — filing deadlines and compliance requirements 
• Udyam Registration Guide — udyamregistration.gov.in — full process and eligibility 
• MCA Annual Compliance — mca.gov.in — annual return deadlines and filing checklist 
• SIDBI MSME Loan Schemes — sidbi.in — loan and financing programs 
 
Mock private documents to create (build these as PDFs using any editor — control the content so retrieval is 
predictable during demo): 
• Sample Udyam Certificate — Fictional business, realistic format, Hyderabad address 
• Sample GST Registration Certificate — Same fictional business, realistic GSTIN 
• Sample Business Agreement — 2-3 page contract with 1-2 intentionally ambiguous clauses for the contract 
review demo 
• Sample Business Plan — 2-page plan for the fictional business — include financials section for eligibility demo 
Keep the fictional business consistent across all mock documents. Same name, same registration number, same address. 
This makes the private KB retrieval demo much cleaner. 
4.4 Pre-Build the ChromaDB Index — Night Before 
Run this script the night before the hackathon. Commit the output /chroma_db folder to your GitHub repo so you load 
it instantly at the venue: 
# ingest.py — run this BEFORE the hackathon, commit chroma_db/  to GitHub 
import chromadb, os

---

# Page 9

from langchain_google_genai import GoogleGenerativeAIEmbeddings  
from langchain_community.document_loaders import PyMuPDFLoader  
from langchain.text_splitter import RecursiveCharacterTextSplitter  
 
embeddings = GoogleGenerativeAIEmbeddings(model='models/text -embedding-004') 
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)  
client = chromadb.PersistentClient(path='./chroma_db')  
collection = client.get_or_create_collection('pu blic_kb') 
 
for fname in os.listdir('./data'): 
    if not fname.endswith('.pdf'): continue  
    loader = PyMuPDFLoader(f'./data/{fname}')  
    docs = loader.load() 
    chunks = splitter.split_documents(docs)  
    for i, chunk in enumerate(chunks): 
        emb = embeddings.embed_query(chunk.page_content)  
        collection.add( 
            ids=[f'{fname}_{i}'], 
            embeddings=[emb], 
            documents=[chunk.page_content], 
            metadatas=[{'source': fname, 'domain': 'public'}]  
        ) 
print(f'Done. Total chunks indexed: {collection.count()}')  
4.5 Build the UI Before the Hackathon — Frontend Person 
The complete Next.js UI must be built and working with mock data before the hackathon starts: 
• Chat interface — message bubbles, user left, Jarvis right, clean typography 
• Document upload panel — drag and drop PDF, shows upload confirmation 
• Source citation cards — below every Jarvis answer, show: source name, excerpt, URL or filename 
• Confidence badge — green / yellow / red indicator per answer based on confidence score 
• Loading skeleton — shown while waiting for API response, prevents UI from looking broken during demo 
Wire the UI to hardcoded mock responses first. Connect to the real backend at the hackathon once the /chat endpoint is 
live.

---

# Page 10

5. 36-Hour Hackathon Roadmap 
Three parallel workstreams run simultaneously from Hour 0. This only works if all pre-hackathon prep in Section 4 is fully 
complete before you arrive. 
 
Person Role Owns 
You (Vignesh) RAG Pipeline Lead LangChain chain, ChromaDB queries, 
Tavily integration, system prompt, 
retrieval tuning 
Teammate 2 Backend Lead FastAPI server, /chat and /upload 
endpoints, CORS, connecting endpoints 
to LangChain 
Teammate 3 Frontend Lead Next.js UI (pre-built), connect to 
FastAPI, source cards, polish, 
presentation slides 
Phase 1 — Hours 0 to 6: Foundation 
Goal: All three systems running independently in isolation. Nothing connected yet. 
You — RAG Pipeline 
• Hour 0-1: Set up Python environment, verify all pip installs, confirm Gemini API key returns a valid embedding 
• Hour 1-2: Load pre-built ChromaDB — run collection.count() to confirm documents are present 
• Hour 2-4: Build basic LangChain retrieval chain — input: query string, output: top 3 chunks from public_kb with 
scores 
• Hour 4-5: Add Tavily search tool alongside ChromaDB — confirm both return results for a test query 
• Hour 5-6: Write system prompt — strict grounding instruction, citation format, confidence-based refusal rule 
Teammate 2 — Backend 
• Hour 0-1: Set up FastAPI project, install dependencies, confirm uvicorn starts on localhost:8000 
• Hour 1-3: Build /health and /chat endpoints with hardcoded mock responses — test with curl 
• Hour 3-5: Build /upload endpoint — receive PDF via multipart form, save temporarily, extract text with PyMuPDF, 
return confirmation 
• Hour 5-6: Test all three endpoints with Postman — all must return expected responses before connecting 
anything 
Teammate 3 — Frontend 
• Hour 0-2: Confirm pre-built Next.js UI runs cleanly on localhost:3000 with mock data 
• Hour 2-4: Wire /upload endpoint — test real file upload, display 'Document indexed' confirmation on success 
• Hour 4-6: Wire /chat endpoint with mock backend — confirm message sends, response displays, source cards 
render 
Phase 2 — Hours 6 to 18: Integration 
Goal: Full pipeline connected end to end. First real question answered with real retrieval from real documents. 
You — RAG Pipeline 
• Hour 6-9: Expose LangChain chain as a callable Python function — input: query + business_id, output: { answer, 
sources, confidence } 
• Hour 9-12: Run 10 real test questions against the public_kb — verify retrieved chunks are actually relevant 
• Hour 12-15: Tune retrieval — adjust chunk_size, chunk_overlap, top_k until answers are consistently grounded

---

# Page 11

• Hour 15-18: Add private KB flow — user upload triggers embedding + insertion into private_kb, both collections 
queried per request 
Teammate 2 — Backend 
• Hour 6-9: Replace mock responses in /chat with real calls to your LangChain function — connect the two systems 
• Hour 9-12: Add error handling — Gemini API timeout, empty ChromaDB, Tavily rate limit — all must fail gracefully 
• Hour 12-15: Connect /upload to private_kb ingestion — PDF upload → PyMuPDF → chunk → embed → 
ChromaDB private_kb 
• Hour 15-18: Full end-to-end test — upload a mock PDF, ask a question about its contents, confirm answer uses 
that document 
Teammate 3 — Frontend 
• Hour 6-9: Switch from mock to real /chat endpoint — send actual questions, display real Jarvis responses 
• Hour 9-12: Build source citation cards using real API response — source name, excerpt, confidence badge 
• Hour 12-15: Upload confirmation flow — user sees document name + 'Ready to query' after successful upload 
• Hour 15-18: Fix layout issues, broken states, loading indicators — the UI must look stable under real data 
Phase 3 — Hours 18 to 28: Polish & Demo Prep 
Goal: Every demo question works reliably. No crashes. Presentation ready. 
You — RAG Pipeline 
• Hour 18-22: Run all 5 demo questions (Section 6) — verify each returns a correct, cited, well-formatted answer 
• Hour 22-25: Implement and test confidence thresholding — confirm low-score queries return the disclaimer 
response 
• Hour 25-28: Prepare fallback answers — if Tavily is blocked at venue, have pre-fetched responses cached for live 
questions 
Teammate 2 — Backend 
• Hour 18-22: Stress test — simulate 5 simultaneous requests, fix any crashes or race conditions 
• Hour 22-25: Standardise API response format — every /chat response must be { answer, sources: [{name, 
excerpt, url, score}], confidence } 
• Hour 25-28: Write a one-page setup README so judges can run it locally if they want to verify 
Teammate 3 — Frontend 
• Hour 18-22: Final UI polish — typography, spacing, colour consistency, dark/light mode if time allows 
• Hour 22-25: Build 5-slide presentation deck — Problem, Solution, Architecture, Live Demo, Impact & Roadmap 
• Hour 25-28: Full demo walkthrough rehearsal — know exactly what to click, what to type, in what order, timed 
under 5 minutes 
Phase 4 — Hours 28 to 36: Buffer & Presentation 
No new features. Fix bugs only. If a fix takes more than 30 minutes, cut the feature and work around it in the demo script. 
• Hour 28-32: Bug fixes only. Prioritise demo stability over feature completeness. 
• Hour 32-34: Full dry run with all three teammates — time it, rehearse answers to judge questions 
• Hour 34-36: Rest. Eat. Review Section 7 judge Q&A. Walk in confident.

---

# Page 12

6. Demo Script — 5 Killer Questions 
These are the five questions you demo live. Each demonstrates a different capability of Jarvis. Rehearse them with the 
exact expected output so there are no surprises on stage. 
 
# Question Demonstrates 
1 Based on my uploaded business plan, 
am I eligible for the Startup India DPIIT 
recognition? 
Private KB retrieval + public KB cross-
reference + eligibility reasoning across 
two sources simultaneously 
2 I just uploaded a vendor agreement. 
Are there any payment clauses that 
could be risky for a small business? 
Private KB retrieval + LLM reasoning on 
user's own document — the contract 
intelligence use case 
3 What is the current interest rate for 
MUDRA Tarun loans and has it changed 
recently? 
Tavily live web fetch — answer comes 
from today's data, not training data. 
The 'live' wow moment. 
4 Which government schemes support 
women-led businesses in Telangana 
right now? 
Hybrid retrieval — public KB + live 
Tavily search combined into one cited 
answer 
5 What compliance filings does my GST-
registered business need to complete 
before the end of this quarter? 
Public KB retrieval + personalized 
framing from uploaded GST certificate 
in private KB 
 
For Question 3, have a cached Tavily response ready in case venue WiFi blocks external APIs. Never let a network issue kill 
your live demo.

---

# Page 13

7. Likely Judge Questions & Your Answers 
• Why not just use ChatGPT or Gemini? — ChatGPT loses all context the moment the conversation ends. Every 
session starts from zero. Jarvis's knowledge base is permanent and grows with the business — you upload a new 
agreement today and it is queryable six months from now without re-uploading anything. Jarvis also cites every 
answer with a source. ChatGPT does not guarantee that. 
 
• What if the retrieval returns wrong information? — We have confidence thresholding. If the similarity score of 
the retrieved chunk is below our set threshold, Jarvis does not answer — it explicitly says it could not find a 
confident answer and points the user to the official source. Every answer also shows the exact retrieved chunk so 
the user can verify the source directly. We built it to refuse to guess, not to guess confidently. 
 
• Is this actually domain-specific or just a generic document chatbot? — The RAG pipeline is domain-agnostic by 
design — the intelligence adapts to whatever knowledge base you point it at. The demo focuses on business 
compliance and documents because that is the highest-pain, highest-value vertical to validate first. The same 
architecture, unchanged, serves a law firm reviewing contracts, an agency managing client briefs, or a 
manufacturing company tracking supplier agreements. Domain changes; pipeline stays the same. 
 
• How is this different from the other RAG submissions here today? — Three things. First, dual knowledge base — 
public external data and the user's own private documents retrieved and merged simultaneously in a single query. 
Most demos have one source. Second, we show the retrieval pipeline live — not just the answer, but which chunks 
were retrieved, from which source, with what confidence score. Third, the product framing is cross-vertical from 
day one — not a one-domain chatbot, a business intelligence layer that adapts to any document-heavy domain. 
 
• Can this scale beyond a hackathon demo? — Yes. ChromaDB is replaced with Pinecone for production 
persistence and per-business namespace isolation. The LangChain chain is modular — adding new data sources, 
new retrieval tools, or a full agentic layer is a configuration change, not a rewrite. The MSME and startup vertical is 
the beachhead — the same architecture has been validated in enterprise knowledge management at companies 
like Notion, Glean, and Guru. We are building the accessible version of that for every business.

---

# Page 14

8. Post-Hackathon Product Roadmap 
The hackathon is not the end. This is what Jarvis becomes after the 36 hours: 
 
Phase Timeline What Gets Built 
Phase 1 — Hackathon 36 hours Working RAG pipeline, hybrid retrieval, 
document upload, 5 demo questions, 
cited answers 
Phase 2 — MVP Month 1-2 User authentication, per-business 
private KB isolation (Pinecone 
namespaces), production FastAPI 
deployment, real onboarding flow 
Phase 3 — Intelligence Layer Month 3-4 Full LangChain agent with tools — web 
search, document comparison, 
proactive flagging of expiring 
documents or risky clauses 
Phase 4 — Vertical Expansion Month 5-6 Domain-specific knowledge bases for 
law firms, agencies, real estate — same 
pipeline, different public KB 
Phase 5 — Platform Month 7+ Multi-tenant SaaS, API access for third-
party integrations, WhatsApp interface 
for non-tech business owners

---

# Page 15

9. Glossary — Key Terms for the Team 
None of us have built a RAG pipeline before. These are the terms that will come up constantly. Read this before 
touching any code. 
 
• RAG (Retrieval-Augmented Generation) — A technique that gives an LLM access to an external knowledge base 
at query time. Instead of relying only on training data, the model retrieves relevant documents and uses them to 
generate a grounded, cited answer. 
• Vector / Embedding — A mathematical representation of text as a list of numbers. Similar meaning produces 
similar numbers. This is how ChromaDB finds relevant documents — it finds the embedding closest to your 
question's embedding. 
• Chunking — Splitting long documents into smaller overlapping pieces before embedding. We use 500 tokens per 
chunk, 50-token overlap. The overlap prevents context from being lost at chunk boundaries. 
• ChromaDB Collection — Think of it as a table in a database, but for vectors. We have two collections: public_kb 
and private_kb. 
• Similarity Score — A number between 0 and 1 produced by ChromaDB per retrieved chunk. 1 means perfect 
semantic match. Below 0.5 means the chunk is probably not relevant to the question. 
• LangChain Chain — A sequence of orchestrated steps — retrieve, build prompt, call LLM, return answer — wired 
together. You define it once; LangChain runs it for every query. 
• System Prompt — Instructions given to Gemini Flash before the user's question. This is where we tell it to answer 
only from retrieved context, always cite sources, and refuse to guess when confidence is low. 
• Tavily — A web search API built specifically for AI applications. It takes a search query, fetches live web pages, 
and returns clean extracted text ready for an LLM — no scraping needed. 
• private_kb vs public_kb — Two ChromaDB collections. public_kb holds pre-indexed general knowledge 
(regulations, schemes, market data). private_kb holds the specific business's own uploaded documents. Both are 
queried per user request. 
• FastAPI — A Python web framework for building REST APIs quickly. We use it to expose our LangChain pipeline as 
HTTP endpoints that the Next.js frontend calls. 
• PyMuPDF — A Python library that extracts clean text from PDF files. When a user uploads any document, 
PyMuPDF converts it to plain text so it can be chunked and embedded. 
 
 
Jarvis  ·  Vynedam Talent Hunt 2K26  ·  Glorx Digital Agency