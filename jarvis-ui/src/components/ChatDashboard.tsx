"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const SplitText = dynamic(() => import("./SplitText"), { ssr: false });

interface ChatDashboardProps {
  onGoToLanding: () => void;
  onLogout: () => void;
}

interface Message {
  sender: "user" | "jarvis";
  text: string;
  timestamp: string;
  sources?: { name: string; excerpt: string; score: number; type: string }[];
  confidence?: number;
  isRefusal?: boolean;
}

interface PrivateDoc {
  name: string;
  size: string;
  status: "ready" | "indexing" | "error";
  uploadedAt: string;
}

export default function ChatDashboard({ onGoToLanding, onLogout }: ChatDashboardProps) {
  // Config states
  const [googleApiKey, setGoogleApiKey] = useState("AIzaSyD-mockKey-123456789");
  const [tavilyApiKey, setTavilyApiKey] = useState("tvly-mockKey-987654321");
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [topK, setTopK] = useState(3);
  const [threshold, setThreshold] = useState(0.70);
  
  const [systemPrompt, setSystemPrompt] = useState(
    `You are Jarvis, a trusted AI Business Intelligence Assistant. 
Your goal is to answer the user's questions utilizing ONLY the retrieved documents in the provided context (Local ChromaDB public_kb and private_kb) and live Tavily web search results.
Rules:
1. Always cite the exact document name, page, and snippet.
2. If the confidence score of the retrieved chunks is below the threshold, refuse to answer. Do not guess.
3. Be professional, concise, and structured.`
  );

  // Private docs state
  const [privateDocs, setPrivateDocs] = useState<PrivateDoc[]>([
    { name: "sample_udyam_certificate.pdf", size: "245 KB", status: "ready", uploadedAt: "Today, 10:45 AM" },
    { name: "sample_gst_registration.pdf", size: "312 KB", status: "ready", uploadedAt: "Today, 10:46 AM" },
    { name: "sample_business_plan.pdf", size: "1.2 MB", status: "ready", uploadedAt: "Today, 11:15 AM" },
  ]);

  // Document tree directories
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    public: true,
    confidential: false,
    revenue: false,
    certificates: true,
    invoices: false,
    approval: false,
    credit: false,
  });

  const [activeFile, setActiveFile] = useState<string>("");

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const [documentDirectories, setDocumentDirectories] = useState([
    {
      id: "public",
      name: "public",
      files: [
        { name: "Startup_India_DPIIT_Guidelines.pdf", size: "312 KB" },
        { name: "MUDRA_Loan_Scheme_Details.pdf", size: "185 KB" },
        { name: "CGTMSE_Credit_Guarantee_Guide.pdf", size: "245 KB" },
        { name: "GST_Compliance_Calendar.pdf", size: "128 KB" }
      ]
    },
    {
      id: "confidential",
      name: "confidential",
      files: [
        { name: "Client_Vendor_Agreement.pdf", size: "1.2 MB" },
        { name: "Fictional_Founder_MOU.pdf", size: "450 KB" },
        { name: "Standard_NDA_Template.pdf", size: "115 KB" }
      ]
    },
    {
      id: "revenue",
      name: "revenue",
      files: [
        { name: "Q3_Outstanding_Invoices.pdf", size: "95 KB" },
        { name: "Annual_Turnover_Report.pdf", size: "340 KB" }
      ]
    },
    {
      id: "certificates",
      name: "certificates",
      files: [
        { name: "Sample_Udyam_Certificate.pdf", size: "110 KB" },
        { name: "Sample_GST_Registration.pdf", size: "290 KB" },
        { name: "Sample_Business_Plan.pdf", size: "1.2 MB" }
      ]
    },
    {
      id: "invoices",
      name: "invoices",
      files: [
        { name: "Invoices_Glorx_Digital_Q3.pdf", size: "512 KB" },
        { name: "Supplier_Invoice_TataSteel.pdf", size: "640 KB" }
      ]
    },
    {
      id: "approval",
      name: "approval documents",
      files: [
        { name: "NOC_Municipal_Corporation.pdf", size: "780 KB" },
        { name: "Board_Resolution_2024.pdf", size: "220 KB" }
      ]
    },
    {
      id: "credit",
      name: "credit docs",
      files: [
        { name: "SIDBI_MSME_Loan_App.pdf", size: "1.4 MB" },
        { name: "Tarun_Mudra_Sanction_Letter.pdf", size: "430 KB" }
      ]
    }
  ]);

  const handleFileSelect = (fileName: string) => {
    setActiveFile(fileName);
    setInputVal((prev) => {
      const space = prev.trim() ? " " : "";
      return prev + space + `@${fileName}`;
    });
  };

  // Messages state (starts empty now)
  const [messages, setMessages] = useState<Message[]>([]);

  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [welcomeFade, setWelcomeFade] = useState(false);

  useEffect(() => {
    // Start fading out after 2.5 seconds
    const fadeTimeout = setTimeout(() => {
      setWelcomeFade(true);
    }, 2500);

    // Completely remove from DOM after 4.0 seconds (1.5s of transition)
    const removeTimeout = setTimeout(() => {
      setWelcomeVisible(false);
    }, 4000);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  const showWelcome = welcomeVisible && messages.length === 0;

  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadingFileName, setUploadingFileName] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Pre-compiled answers corresponding to the demo script
  const RAGAnswers: Record<string, Omit<Message, "sender" | "timestamp">> = {
    "dpiit": {
      text: "Yes, you are highly eligible for the Startup India DPIIT recognition. Based on your uploaded **sample_business_plan.pdf**, your business is incorporated as a Private Limited Company (2024, Hyderabad) with a current turnover of ₹22 Lakhs, which is well below the ₹100 Crore limit. You meet all criteria outline in the **Startup India DPIIT Guidelines**.",
      confidence: 0.88,
      sources: [
        {
          name: "Startup_India_DPIIT_Guidelines.pdf",
          excerpt: "DPIIT recognition is open to Private Limited Companies, Registered Partnerships, and LLCs. Your business must have a turnover below ₹100 Crore and be incorporated for less than 10 years.",
          score: 0.88,
          type: "Public Vector DB"
        },
        {
          name: "sample_business_plan.pdf",
          excerpt: "Company Structure: Private Limited Company. Incorporation Date: Jan 12, 2024. Head Office: Hyderabad. Current Annual Turnover: ₹22,00,000.",
          score: 0.92,
          type: "Private Vector DB"
        }
      ]
    },
    "risk": {
      text: "Yes, there is a high-risk clause. In **Client_Vendor_Agreement.pdf (Clause 4.2)**, the client is allowed a 90-day payment term interest-free. Under MSME regulations (Delayed Payments Act), statutory payments must be cleared within 45 days. Signing this clause waives your interest claims and harms cash flow.",
      confidence: 0.82,
      sources: [
        {
          name: "Client_Vendor_Agreement.pdf",
          excerpt: "Clause 4.2 states: 'The Client reserves the right to delay payments up to 90 days from the invoice date without incurring interest charges...'",
          score: 0.85,
          type: "Private Vector DB"
        },
        {
          name: "MSME_Samadhaan_Delayed_Payments_Act.pdf",
          excerpt: "All buyers are mandated to pay MSME suppliers within 45 days. Any contract terms extending past 45 days are legally void, and penal interest of 3x RBI Bank Rate applies.",
          score: 0.81,
          type: "Public Vector DB"
        }
      ]
    },
    "mudra": {
      text: "According to live data fetched from **mudra.org.in**, the interest rates for MUDRA Tarun loans (funding between ₹5 Lakhs and ₹10 Lakhs) range between **9.25% and 12.15% per annum**. This rate is floating and tied to bank-specific MCLR/RLLR, which saw a minor 0.15% increase in the last quarter.",
      confidence: 0.94,
      sources: [
        {
          name: "Tavily Live Search: mudra.org.in/rates",
          excerpt: "MUDRA Tarun loans cover limits from ₹5 Lakhs to ₹10 Lakhs. Current interest rates depend on the lending bank, typically ranging between 9.25% to 12.15% per annum as of July 2026.",
          score: 0.94,
          type: "Live Web"
        }
      ]
    },
    "women": {
      text: "Women entrepreneurs in Telangana can leverage two major programs: \n1. **CGTMSE Scheme (National)**: Offers concession on guarantee fee + 85% credit coverage. \n2. **T-PRIDE (Telangana State)**: Offers a 9% interest subsidy on capital loans and 25% investment subsidy on fixed capital.",
      confidence: 0.79,
      sources: [
        {
          name: "CGTMSE_Guidelines.pdf",
          excerpt: "CGTMSE provides a 10% concessions on guarantee fees and guarantees up to 85% for women-led micro-enterprises.",
          score: 0.83,
          type: "Public Vector DB"
        },
        {
          name: "T-PRIDE_Telangana_Scheme.pdf",
          excerpt: "T-PRIDE offers 9% interest subsidy on term loans and 25% investment subsidy on fixed capital for women SC/ST entrepreneurs.",
          score: 0.79,
          type: "Public Vector DB"
        }
      ]
    },
    "gst": {
      text: "Based on your **sample_gst_registration.pdf** (regular tax status), you must complete: \n1. **GSTR-1**: Filing of sales/outward supplies due on the 11th of each month. \n2. **GSTR-3B**: Tax payment & summary return due on the 20th of each month.",
      confidence: 0.72,
      sources: [
        {
          name: "GST_Compliance_Calendar.pdf",
          excerpt: "GSTR-1 (monthly filing of outward supplies) is due on the 11th of every month. GSTR-3B (monthly summary return) is due on the 20th of the following month.",
          score: 0.75,
          type: "Public Vector DB"
        },
        {
          name: "sample_gst_registration.pdf",
          excerpt: "Taxpayer Type: Regular. GSTIN: 36AAAAA1111A1Z1. State Jurisdiction: Telangana.",
          score: 0.91,
          type: "Private Vector DB"
        }
      ]
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMsg: Message = { sender: "user", text, timestamp };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate pipeline processing
    setTimeout(() => {
      // Find matching demo keys
      let matchKey = "";
      const lower = text.toLowerCase();
      if (lower.includes("eligible") || lower.includes("dpiit") || lower.includes("startup india")) {
        matchKey = "dpiit";
      } else if (lower.includes("risk") || lower.includes("agreement") || lower.includes("vendor") || lower.includes("payment")) {
        matchKey = "risk";
      } else if (lower.includes("mudra") || lower.includes("tarun") || lower.includes("interest rate")) {
        matchKey = "mudra";
      } else if (lower.includes("women") || lower.includes("telangana")) {
        matchKey = "women";
      } else if (lower.includes("gst") || lower.includes("compliance") || lower.includes("filing")) {
        matchKey = "gst";
      }

      let responseMsg: Message;
      if (matchKey && RAGAnswers[matchKey]) {
        const match = RAGAnswers[matchKey];
        // Apply confidence threshold logic
        if (match.confidence! < threshold) {
          responseMsg = {
            sender: "jarvis",
            text: `❌ RAG Pipeline Refusal (Score: ${match.confidence} < Threshold: ${threshold})\n\n"I could not retrieve highly confident context to answer this query. To ensure safety and compliance, Jarvis has blocked this answer to prevent hallucination. Please reference the official documentation directly: [${match.sources?.[0].name}]."`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRefusal: true,
            sources: match.sources,
            confidence: match.confidence,
          };
        } else if (threshold > 0.5 && match.confidence! < threshold + 0.15) {
          responseMsg = {
            sender: "jarvis",
            text: `⚠️ Disclaimer Required (Score: ${match.confidence} / Threshold: ${threshold})\n\n"${match.text}"\n\n[Caution] Please verify this with the official source before making business decisions.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: match.sources,
            confidence: match.confidence,
          };
        } else {
          responseMsg = {
            sender: "jarvis",
            text: match.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: match.sources,
            confidence: match.confidence,
          };
        }
      } else {
        // Fallback for random questions
        responseMsg = {
          sender: "jarvis",
          text: `🔍 Simulated Query Search (ChromaDB + Tavily Web)\n\n"I searched the public and private databases for '${text}', but found no matching documents. \n\nTo answer this query, please ensure you have uploaded the relevant PDFs containing the text. Since no high-confidence embeddings match (Score < ${threshold}), I am declining to answer to prevent hallucination."`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: 0.32,
          isRefusal: true,
        };
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, responseMsg]);
    }, 1800);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFileName(file.name.toLowerCase());
    setUploadProgress(0);

    // Simulate progress upload & indexing in ChromaDB
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Add file to privateDocs
            const newDoc: PrivateDoc = {
              name: file.name.toLowerCase(),
              size: `${(file.size / 1024).toFixed(0)} KB`,
              status: "ready",
              uploadedAt: "Just now",
            };
            setPrivateDocs((prevDocs) => [newDoc, ...prevDocs]);

            // Add file to document directories dynamically
            const isCert = file.name.toLowerCase().includes("cert") || file.name.toLowerCase().includes("registration") || file.name.toLowerCase().includes("udyam");
            const targetFolderId = isCert ? "certificates" : "confidential";
            setDocumentDirectories((prevDirs) =>
              prevDirs.map((dir) => {
                if (dir.id === targetFolderId) {
                  return {
                    ...dir,
                    files: [
                      { name: file.name.toLowerCase(), size: `${(file.size / 1024).toFixed(0)} KB` },
                      ...dir.files
                    ]
                  };
                }
                return dir;
              })
            );
            
            // Add alert message in chat
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages((prevMsgs) => [
              ...prevMsgs,
              {
                sender: "jarvis",
                text: `📂 **File Indexed Successfully**\n- Document: \`${file.name.toLowerCase()}\`\n- Vector Database: \`private_kb\`\n- Chunking Policy: \`${chunkSize} char size / ${chunkOverlap} overlap\`\n- Status: \`100% Embedded\`\n\nI have chunked and embedded this document. You can now ask questions about its content!`,
                timestamp,
              },
            ]);
            setUploadProgress(-1);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="relative min-h-screen lg:h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden">
      
      {/* Top Navbar */}
      <header className="glass-panel border-b border-white/5 py-3 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="gradient-brand w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-md">
            J
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-mono">JARVIS CONSOLE</span>
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                Workspace Dev
              </span>
            </div>
          </div>
        </div>

        {/* API status row */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-md text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gemini Flash
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-md text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tavily Web
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-md text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ChromaDB
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToLanding}
            className="text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Landing
          </button>
          <button
            onClick={onLogout}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 bg-zinc-900 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:overflow-hidden h-auto lg:h-[calc(100vh-57px)]">
        
        {/* Left Sidebar: Document Explorer Tree */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-zinc-950/40 p-4 md:p-5 flex flex-col justify-between overflow-y-auto overscroll-y-contain">
          
          <div className="flex flex-col gap-5">
            
            {/* Title */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                Document Directories
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                Click folders to reveal files. Click a file to reference it in your prompt context (@ tag).
              </p>
            </div>

            {/* Document Directories Tree */}
            <div className="flex flex-col gap-1.5 font-sans text-xs">
              {documentDirectories.map((dir) => {
                const isExpanded = expandedFolders[dir.id];
                return (
                  <div key={dir.id} className="flex flex-col">
                    {/* Directory Row */}
                    <button
                      onClick={() => toggleFolder(dir.id)}
                      className="flex items-center justify-between py-1.5 px-2 hover:bg-zinc-900/60 rounded-lg text-zinc-400 hover:text-white transition-all text-left font-medium select-none outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-3 h-3 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7-7" />
                        </svg>
                        <svg className="w-3.5 h-3.5 text-amber-500/80 fill-amber-500/10 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="truncate">{dir.name}</span>
                      </div>
                      <span className="text-[8.5px] text-zinc-600 font-mono bg-zinc-900 px-1 rounded shrink-0">
                        {dir.files.length}
                      </span>
                    </button>

                    {/* Files dropdown */}
                    {isExpanded && (
                      <div className="flex flex-col border-l border-white/5 ml-3.5 mt-1 pl-1.5 gap-1">
                        {dir.files.map((file) => {
                          const isActive = activeFile === file.name;
                          return (
                            <button
                              key={file.name}
                              onClick={() => handleFileSelect(file.name)}
                              className={`flex items-center justify-between text-left py-1 px-1.5 hover:bg-white/5 rounded-md transition-all text-[10px] group cursor-pointer ${
                                isActive
                                  ? "bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 font-bold"
                                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <svg className="w-3 h-3 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate">{file.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document Uploader integration */}
            <div className="border-t border-white/5 pt-4">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-2 px-1">
                Upload New Document
              </span>
              <div
                onClick={handleFileUploadClick}
                className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 bg-zinc-900/20 hover:bg-zinc-900/60 rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-300">Upload PDF</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Auto-embeds to active directory</p>
                </div>
              </div>
            </div>

            {/* Upload status indicator */}
            {uploadProgress >= 0 && (
              <div className="bg-zinc-900 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 font-mono text-[9px]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 truncate max-w-[120px]">{uploadingFileName}</span>
                  <span className="text-indigo-400 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="gradient-brand h-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

          </div>



        </aside>

        {/* Center Panel: Main Chat Workspace */}
        <section className="lg:col-span-9 flex flex-col justify-between bg-zinc-950/20 overflow-hidden relative">
          {showWelcome && (
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-1500 ${welcomeFade ? "opacity-0" : "opacity-100"}`}>
              <SplitText
                text="Welcome To Jarvis Workplace"
                className="text-2xl md:text-3xl font-bold tracking-tight text-white font-mono bg-zinc-950/80 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-2xl"
                delay={60}
                duration={0.8}
                ease="power3.out"
                splitType="chars"
              />
            </div>
          )}
          
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 md:pb-44 flex flex-col gap-6 overscroll-y-contain">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 ${isUser ? "self-end items-end" : "self-start items-start"} max-w-[85%]`}
                >
                  <div className="text-[9px] text-zinc-500 font-mono px-1">
                    {isUser ? "USER" : "JARVIS CO-PILOT"} · {msg.timestamp}
                  </div>

                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : msg.isRefusal
                      ? "bg-red-950/20 border border-red-500/25 text-red-200 rounded-tl-sm font-mono text-xs"
                      : "bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>

                  {/* Render citations inside chat bubble */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full mt-1.5">
                      <span className="text-[9px] font-bold text-zinc-500 font-mono tracking-widest uppercase px-1">
                        Grounded Sources Retrieved ({msg.sources.length})
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.sources.map((src, sidx) => (
                          <div key={sidx} className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 flex flex-col gap-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-indigo-400 font-mono truncate max-w-[200px]">{src.name}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                Match Score: {src.score.toFixed(2)} · {src.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 italic bg-black/20 p-2 rounded border border-white/[0.02]">
                              &ldquo;{src.excerpt}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="self-start flex flex-col gap-1.5 max-w-[80%]">
                <div className="text-[9px] text-zinc-500 font-mono">JARVIS CO-PILOT is retrieving context...</div>
                <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl rounded-tl-sm text-sm">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-xs font-mono">Retrieving indexes & synthesizing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom input area */}
          <div className="p-4 border-t border-white/5 bg-zinc-950/95 backdrop-blur-md fixed bottom-0 right-0 w-full lg:w-[75%] z-20 flex flex-col gap-4">
            
            {/* Quick demo prompt chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[10px] font-bold text-zinc-500 font-mono self-center shrink-0 uppercase mr-1">
                Demo Chips:
              </span>
              <button
                onClick={() => handleSend("Based on my business plan, am I eligible for Startup India DPIIT recognition?")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors"
              >
                DPIIT Eligibility
              </button>
              <button
                onClick={() => handleSend("I just uploaded a vendor agreement. Are there any payment clauses that could be risky?")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors"
              >
                Agreement Risk Check
              </button>
              <button
                onClick={() => handleSend("What is the current interest rate for MUDRA Tarun loans?")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors"
              >
                Live Mudra Rates
              </button>
              <button
                onClick={() => handleSend("What compliance filings does my GST-registered business need before quarter end?")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors"
              >
                GST Calendar
              </button>
            </div>

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="flex gap-3 items-center"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Jarvis anything about public schemes or uploaded files..."
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="gradient-brand disabled:opacity-50 text-white p-3 rounded-xl hover:opacity-90 shadow-md transition-all shrink-0 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

        </section>

        {/* Right Sidebar removed to keep layout clean */}

      </div>
    </div>
  );
}
