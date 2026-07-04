"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { sendChatQuery, uploadDocument, Source } from "@/lib/api";

const SplitText = dynamic(() => import("./SplitText"), { ssr: false });

interface ChatDashboardProps {
  onGoToLanding: () => void;
  onLogout: () => void;
}

interface Message {
  sender: "user" | "jarvis";
  text: string;
  timestamp: string;
  sources?: Source[];
  confidence?: "high" | "medium" | "low";
  isRefusal?: boolean;
}

interface PrivateDoc {
  name: string;
  size: string;
  status: "ready" | "indexing" | "error";
  uploadedAt: string;
}

const DOCUMENT_PREVIEWS: Record<string, { title: string; date: string; author: string; content: string }> = {
  "startup_india_dpiit_guidelines.pdf": {
    title: "Startup India DPIIT Recognition & Tax Exemptions Guidelines",
    date: "Revised 2024",
    author: "Department for Promotion of Industry and Internal Trade (DPIIT)",
    content: `### 1. Eligibility Criteria for Recognition
- **Company Type**: Must be incorporated as a Private Limited Company, Registered Partnership Firm, or Limited Liability Partnership (LLP).
- **Age of Startup**: Period of existence and operations should not exceed 10 years from the date of incorporation.
- **Turnover Limit**: Annual turnover of the entity for any of the financial years since incorporation/registration has not exceeded INR 100 Crore.
- **Innovation & Scalability**: The entity should be working towards innovation, development or improvement of products or processes or services, or have a scalable business model with high potential of employment generation or wealth creation.

### 2. Benefits of DPIIT Recognition
- **Income Tax Exemption**: Eligible for 3-year tax holiday under Section 80-IAC.
- **Self-Certification**: Self-certify compliance with 6 labour laws and 3 environmental laws.
- **Easy Winding Up**: Fast-track exit for startups within 90 days under Insolvency and Bankruptcy Code.
- **IPR Support**: Up to 80% rebate in patent filing and 50% rebate in trademark filing.`
  },
  "mudra_loan_scheme_details.pdf": {
    title: "Pradhan Mantri MUDRA Yojana (PMMY) Scheme Details",
    date: "Updated FY 2024-25",
    author: "Ministry of Finance, Government of India",
    content: `### 1. Loan Categories
- **Shishu**: Loans up to INR 50,000 (designed for startup and entry-stage entrepreneurs).
- **Kishor**: Loans from INR 50,000 up to INR 5 Lakh (designed for existing businesses looking for expansion phase).
- **Tarun**: Loans from INR 5 Lakh up to INR 10 Lakh (designed for established businesses requiring larger capital injection).

### 2. General Terms & Conditions
- **Collateral**: No collateral security is required for MUDRA loans.
- **Tenure**: Repayment period ranges from 3 to 5 years depending on cash flows.
- **Interest Rate**: Determined by the bank based on MCLR and credit profile, typically between 8.5% to 12% p.a.
- **Purpose**: Working capital, machinery purchase, business expansion, and business vehicles.`
  },
  "cgtmse_credit_guarantee_guide.pdf": {
    title: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    date: "June 2024 Update",
    author: "CGTMSE Trust / SIDBI",
    content: `### 1. Core Objective
Provides collateral-free credit facilities to Micro and Small Enterprises (MSEs) by offering guarantee coverage for loans.

### 2. Eligibility & Coverage
- **Eligible Borrowers**: New and existing Micro and Small Enterprises. Retail trade, educational institutions, and training centers are also eligible.
- **Max Loan Limit**: Guarantee coverage up to INR 5 Crore per borrower.
- **Guarantee Cover**:
  - Up to 85% for Micro Enterprises (loans up to INR 5 Lakh).
  - Up to 75% for default loan amounts between INR 5 Lakh and INR 5 Crore.
  - Up to 85% for women entrepreneurs, SC/ST, and units in North East Region.`
  },
  "gst_compliance_calendar.pdf": {
    title: "GST Compliance & Tax Filings Calendar",
    date: "FY 2024-2025",
    author: "Goods and Services Tax Network (GSTN)",
    content: `### Monthly Compliance Schedule
- **GSTR-1 (Outward Supplies)**: Due by the 11th of the succeeding month for regular taxpayers.
- **GSTR-3B (Summary Return & Tax Payment)**: Due by the 20th of the succeeding month.
- **GSTR-2B (Auto-drafted ITC statement)**: Generated on the 14th of every month.

### Quarterly Compliance Schedule
- **QRMP Scheme**: GSTR-1 and GSTR-3B filed quarterly; tax paid monthly via CMP-08 by the 18th of the month following the quarter.
- **GSTR-4 (Composition Taxpayers)**: Annual return due by 30th April of the next FY.`
  },
  "client_vendor_agreement.pdf": {
    title: "Master Services Agreement (MSA) - Client & Vendor",
    date: "Executed Jan 15, 2024",
    author: "Legal Dept, Jarvis Tech Solutions",
    content: `### Summary of Key Terms
- **Scope of Services**: Software development, API integrations, and ongoing support services.
- **Intellectual Property**: All deliverables created by the Vendor under this Agreement shall belong solely to the Client upon full payment.
- **Payment Terms**: Invoice sent monthly; Payment due Net 30 days from date of receipt of invoice.
- **Confidentiality**: Active for the duration of the Agreement and 3 years post-termination.
- **Limitation of Liability**: Capped at the total amount paid by Client to Vendor in the 6 months preceding the claim.`
  },
  "fictional_founder_mou.pdf": {
    title: "Founder Memorandum of Understanding (MOU)",
    date: "Signed Jan 10, 2024",
    author: "Co-Founders (Rahul S. & Priyan K.)",
    content: `### 1. Equity Distribution
- **Rahul S. (CEO)**: 52% Equity Share.
- **Priyan K. (CTO)**: 48% Equity Share.

### 2. Vesting & Cliff
- **Vesting Period**: 4 years monthly vesting.
- **Cliff Period**: 1-year cliff. No shares shall vest if a founder exits within 12 months.

### 3. Roles and Intellectual Property
All intellectual property created during the operations of the startup belongs fully to the registered corporate entity.`
  },
  "standard_nda_template.pdf": {
    title: "Mutual Non-Disclosure Agreement (NDA)",
    date: "Template V2",
    author: "Internal Legal Council",
    content: `### Confidentiality Obligations
- **Definition**: Confidential Information includes technical data, trade secrets, business plans, customer lists, and financial projections.
- **Standard of Care**: Receiving Party agrees to use the same degree of care to prevent disclosure as it uses for its own confidential data (no less than reasonable care).
- **Term**: This Agreement shall remain in effect for 3 years from the date of disclosure.`
  },
  "q3_outstanding_invoices.pdf": {
    title: "Q3 Outstanding Invoices & Accounts Receivable Summary",
    date: "As of October 1, 2024",
    author: "Finance & Accounts Team",
    content: `### Aging Accounts Receivable Report
| Invoice ID | Client Name | Amount (INR) | Due Date | Overdue Days | Status |
|---|---|---|---|---|---|
| INV-2024-89 | Glorx Digital | 1,50,000 | Sep 15, 2024 | 15 days | Pending |
| INV-2024-91 | Initech Corp | 2,10,000 | Aug 30, 2024 | 31 days | Follow-up |
| INV-2024-95 | Hooli Services | 1,20,000 | Jul 15, 2024 | 77 days | Escalated |

**Total Outstanding Receivables**: INR 4,80,000`
  },
  "annual_turnover_report.pdf": {
    title: "Annual Financial Turnover & Revenue Report",
    date: "FY 2023-24",
    author: "Certified Chartered Accountant",
    content: `### Executive Financial Summary
- **Gross Revenue**: INR 22,15,400 (from consulting and platform services)
- **Direct Costs (COGS)**: INR 6,45,000
- **Gross Profit**: INR 15,70,400
- **Operational Expenses**: INR 8,12,000
- **Net Profit before Tax**: INR 7,58,400
- **Year-on-Year Growth**: +42.5% compared to FY 2022-23.`
  },
  "sample_udyam_certificate.pdf": {
    title: "Udyam Registration Certificate - Ministry of MSME",
    date: "Issued March 14, 2024",
    author: "Govt of India, Ministry of Micro, Small and Medium Enterprises",
    content: `### Certificate Details
- **Udyam Registration Number**: UDYAM-TS-02-00984321
- **Name of Enterprise**: Jarvis Tech Solutions Private Limited
- **Major Activity**: Service Provider (IT Consulting & Software Development)
- **Enterprise Classification**: **MICRO Enterprise** (based on turnover and investment limits).
- **Date of Incorporation**: January 12, 2024`
  },
  "sample_gst_registration.pdf": {
    title: "GST Registration Certificate (Form GST REG-06)",
    date: "Issued January 20, 2024",
    author: "Goods and Services Tax Department, Government of India",
    content: `### GSTIN Information
- **GSTIN**: 36AAFJC8742N1Z9
- **Legal Name**: Jarvis Tech Solutions Private Limited
- **Trade Name**: Jarvis AI
- **Constitution of Business**: Private Limited Company
- **Principal Place of Business**: H.No 4-12, Gachibowli Financial District, Hyderabad, Telangana, 500032.
- **Date of Liability**: January 20, 2024`
  },
  "sample_business_plan.pdf": {
    title: "Strategic Business Plan & Financial Model - V1.4",
    date: "Compiled February 2024",
    author: "Management Board, Jarvis AI",
    content: `### 1. Executive Summary
Jarvis AI is a SaaS platform providing unified RAG assistant capability for MSMEs to query their business context, policies, and files.

### 2. Operating Metrics
- **Headquarters**: Hyderabad, India.
- **Team Size**: 5 Full-Time Employees.
- **Projected Sales (Year 1)**: INR 22 Lakhs.
- **Target Audience**: Micro & Small Enterprises, freelancers, legal consultants.`
  },
  "invoices_glorx_digital_q3.pdf": {
    title: "Commercial Invoice - Glorx Digital Q3 Billing",
    date: "Invoice Date: September 15, 2024",
    author: "Finance Dept, Jarvis Tech Solutions",
    content: `### Invoice Details (INV-2024-89)
- **Billing To**: Glorx Digital Services Ltd, Bengaluru.
- **Services Rendered**: Consulting and custom API deployment.
- **Amount Due**: INR 1,50,000 (inclusive of CGST/SGST @ 18%).
- **Payment Method**: Bank Transfer to HDFC Bank A/c 50200045237890.
- **Status**: Overdue as of Oct 1, 2024.`
  },
  "supplier_invoice_tatasteel.pdf": {
    title: "Supplier Purchase Invoice - Tata Steel Ltd",
    date: "August 22, 2024",
    author: "Tata Steel Accounts Team",
    content: `### Invoice Details (INV-TS-99238)
- **Billing From**: Tata Steel Limited, Jamshedpur Office.
- **Item**: Structural Steel & Reinforcement Beams (Quantity: 4 Metric Tons).
- **Subtotal**: INR 2,71,186
- **Tax (IGST @ 18%)**: INR 48,814
- **Grand Total**: INR 3,20,000
- **Status**: Paid in full on August 28, 2024.`
  },
  "noc_municipal_corporation.pdf": {
    title: "No Objection Certificate (NOC) for Commercial Operations",
    date: "Issued April 10, 2024",
    author: "Greater Hyderabad Municipal Corporation (GHMC)",
    content: `### Compliance Clearance
- **Applicant**: Jarvis Tech Solutions Private Limited
- **Facility Address**: Gachibowli Financial District, Hyderabad.
- **Clearance Scope**: Building structural safety, fire safety compliance, and environmental sanitation check.
- **Validity**: Expires April 9, 2029 (5-year validity).`
  },
  "board_resolution_2024.pdf": {
    title: "Certified Board Resolution - Bank Operations & Borrowings",
    date: "Meeting Date: February 5, 2024",
    author: "Board of Directors, Jarvis Tech Solutions",
    content: `### Resolution Details
- **Passed by**: Unanimous consent of the Board of Directors.
- **Resolution**: Resolved that the Company open a Cash Credit / Current Account with State Bank of India.
- **Authorized Signatories**: Rahul S. (CEO) and Priyan K. (CTO) are jointly and severally authorized to sign documents, execute loan applications, and execute transactions on behalf of the company up to INR 50 Lakhs.`
  },
  "sidbi_msme_loan_app.pdf": {
    title: "SIDBI Direct Credit Scheme - Loan Application Form",
    date: "Submitted April 18, 2024",
    author: "Jarvis Tech Solutions / SIDBI Portal",
    content: `### Loan Application Form (Ref: SIDBI-2024-MSME-984)
- **Lender**: Small Industries Development Bank of India (SIDBI).
- **Loan Scheme**: Direct Credit for Plant, Machinery, and Technology Upgradation.
- **Requested Principal Amount**: INR 15,000,000 (INR 15 Lakhs).
- **Collateral Proposed**: Primary security of machinery purchased, plus secondary personal guarantees of co-founders.`
  },
  "tarun_mudra_sanction_letter.pdf": {
    title: "MUDRA Tarun Scheme - Credit Sanction Letter",
    date: "Dated June 12, 2024",
    author: "State Bank of India, SME Branch Hyderabad",
    content: `### Sanction Terms (Ref: SBI-MUDRA-TARUN-459)
- **Borrower**: Jarvis Tech Solutions Private Limited.
- **Sanctioned Amount**: INR 8,50,000 (INR 8.5 Lakhs).
- **Interest Rate**: 9.25% floating rate (linked to 1-year MCLR).
- **Tenure**: 60 Equated Monthly Instalments (EMIs).
- **Repayment Terms**: Automated debit starting July 2024.`
  }
};

const getPreviewData = (fileName: string) => {
  const normalized = fileName.toLowerCase();
  if (DOCUMENT_PREVIEWS[normalized]) {
    return DOCUMENT_PREVIEWS[normalized];
  }
  return {
    title: fileName,
    date: "Just uploaded",
    author: "User Indexed Document",
    content: `### Document Indexed Successfully
This document (\`${fileName}\`) was uploaded by the user and successfully chunked and embedded in the **private_kb** collection in ChromaDB.

### Document Content Preview
- **File Name**: ${fileName}
- **Access Status**: 100% Vectorized
- **Vector Dimension**: 768 (Gemini Embeddings)

The contents of this document are now available for contextual question-answering in the Jarvis Console.`
  };
};

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
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    title?: string;
    date?: string;
    author?: string;
    content?: string;
  } | null>(null);

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

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
 
    // Add user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMsg: Message = { sender: "user", text, timestamp };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputVal("");
    setIsTyping(true);
 
    try {
      const response = await sendChatQuery(text, "default_business", threshold);
      const isRefusal = response.confidence === "low";
      const jarvisMsg: Message = {
        sender: "jarvis",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        confidence: response.confidence,
        isRefusal
      };
      setMessages((prev) => [...prev, jarvisMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        sender: "jarvis",
        text: `❌ Error communicating with backend: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: "low",
        isRefusal: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
 
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
 
  const handleUploadFile = async (file: File) => {
    if (!file) return;
 
    setUploadingFileName(file.name.toLowerCase());
    setUploadProgress(0);
 
    // Simulate visual progress update
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 100);
 
    try {
      const response = await uploadDocument(file, "default_business");
      clearInterval(progressInterval);
      setUploadProgress(100);
 
      // Add file to privateDocs state
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
          text: `📂 **Document Indexed Successfully**\n- Document: \`${file.name.toLowerCase()}\`\n- Vector Database: \`private_kb\`\n- Status: \`${response.message}\`\n\nI have successfully chunked and embedded this document. You can now ask questions about its content!`,
          timestamp,
          confidence: "high"
        },
      ]);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(-1);
      console.error(err);
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          sender: "jarvis",
          text: `❌ **Failed to index document**\n- Document: \`${file.name.toLowerCase()}\`\n- Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp,
          confidence: "low",
          isRefusal: true
        },
      ]);
    } finally {
      setTimeout(() => setUploadProgress(-1), 1000);
    }
  };
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };
 
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
 
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
 
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
 
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handleUploadFile(file);
    }
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
                            <div
                              key={file.name}
                              className={`flex items-center justify-between text-left rounded-md transition-all text-[10px] group border ${
                                isActive
                                  ? "bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 font-bold"
                                  : "text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-white/5"
                              } py-1 px-1.5 w-full`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFile({
                                    name: file.name,
                                    ...getPreviewData(file.name)
                                  });
                                }}
                                className="flex items-center gap-1.5 truncate flex-1 cursor-pointer text-left focus:outline-none"
                              >
                                <svg className="w-3 h-3 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate">{file.name}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileSelect(file.name);
                                }}
                                className="opacity-40 group-hover:opacity-100 bg-zinc-800/80 hover:bg-indigo-500/30 text-zinc-400 hover:text-indigo-300 font-mono text-[9px] w-4 h-4 flex items-center justify-center rounded transition-all border border-white/5 hover:border-indigo-500/30 cursor-pointer ml-1.5 shrink-0 animate-fade-in"
                                title="Reference in prompt context"
                              >
                                @
                              </button>
                            </div>
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
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/10 shadow-lg scale-[1.02]"
                    : "border-white/10 hover:border-indigo-500/40 bg-zinc-900/20 hover:bg-zinc-900/60"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <svg className={`w-6 h-6 transition-colors ${isDragging ? "text-indigo-400 animate-bounce" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-300">
                    {isDragging ? "Drop PDF Here" : "Upload PDF"}
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Drag-and-drop or select file</p>
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
                  <div className="text-[9px] text-zinc-500 font-mono px-1 flex items-center gap-2">
                    <span>{isUser ? "USER" : "JARVIS CO-PILOT"} · {msg.timestamp}</span>
                    {!isUser && msg.confidence && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold border ${
                        msg.confidence === "high"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : msg.confidence === "medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {msg.confidence} confidence
                      </span>
                    )}
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
                              {src.url ? (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-indigo-400 hover:text-indigo-300 font-mono truncate max-w-[220px] underline flex items-center gap-1 cursor-pointer"
                                >
                                  {src.name}
                                  <svg className="w-2.5 h-2.5 inline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ) : (
                                <span className="font-bold text-indigo-400 font-mono truncate max-w-[220px]">{src.name}</span>
                              )}
                              <span className="text-[9px] text-zinc-500 font-mono">
                                Match Score: {src.score.toFixed(2)}
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
              <div className="self-start flex flex-col gap-2 w-full max-w-[80%]">
                <div className="text-[9px] text-zinc-500 font-mono px-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  JARVIS CO-PILOT is retrieving context...
                </div>
                <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl rounded-tl-sm w-full flex flex-col gap-3">
                  {/* Bouncing dots */}
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[10px]">Retrieving indexes & synthesizing...</span>
                  </div>
                  
                  {/* Visual Skeleton Bars */}
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-[90%] bg-zinc-800 shimmer-bg rounded-md" />
                    <div className="h-3 w-[95%] bg-zinc-800 shimmer-bg rounded-md" />
                    <div className="h-3 w-[60%] bg-zinc-800 shimmer-bg rounded-md" />
                  </div>
                  
                  {/* Sources Skeleton */}
                  <div className="mt-2 border-t border-white/5 pt-3 flex flex-col gap-2">
                    <div className="h-2.5 w-[30%] bg-zinc-800 shimmer-bg rounded-md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="h-10 bg-zinc-800/80 shimmer-bg rounded-xl border border-white/[0.02]" />
                      <div className="h-10 bg-zinc-800/80 shimmer-bg rounded-xl border border-white/[0.02]" />
                    </div>
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

        {/* Document Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white font-mono truncate">{previewFile.name}</h3>
                    <p className="text-[10px] text-zinc-500">Document Reader Context</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 overflow-y-auto bg-zinc-950/40 custom-scrollbar">
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 md:p-6 font-sans text-xs text-zinc-300 leading-relaxed shadow-inner">
                  {/* Mock official document look */}
                  <div className="border-b border-white/5 pb-4 mb-4 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">{previewFile.title}</h2>
                      <p className="text-[10px] text-zinc-500 mt-1">Author/Source: {previewFile.author}</p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full shrink-0 self-start">
                      {previewFile.date}
                    </span>
                  </div>

                  <div className="prose prose-invert prose-xs max-w-none text-zinc-300 space-y-4 font-sans">
                    {previewFile.content?.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('###')) {
                        return <h3 key={idx} className="text-xs font-bold text-indigo-400 font-mono pt-2 border-b border-white/5 pb-1 mb-2">{paragraph.replace('###', '').trim()}</h3>;
                      }
                      if (paragraph.startsWith('-')) {
                        return (
                          <ul key={idx} className="list-disc pl-4 space-y-1.5 my-2">
                            {paragraph.split('\n').map((li, liIdx) => (
                              <li key={liIdx}>{li.replace(/^-\s*/, '').trim()}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.startsWith('|')) {
                        const rows = paragraph.split('\n').filter(r => r.trim());
                        return (
                          <div key={idx} className="overflow-x-auto my-3 border border-white/5 rounded-lg">
                            <table className="min-w-full text-[10px]">
                              <thead>
                                <tr className="bg-zinc-900/80 text-zinc-400 border-b border-white/5">
                                  {rows[0].split('|').map((col, cIdx) => {
                                    const trimmed = col.trim();
                                    if (trimmed === "" && (cIdx === 0 || cIdx === rows[0].split('|').length - 1)) return null;
                                    return <th key={cIdx} className="px-3 py-2 text-left font-mono">{trimmed}</th>;
                                  }).filter(Boolean)}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {rows.slice(2).map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-white/5">
                                    {row.split('|').map((col, cIdx) => {
                                      const trimmed = col.trim();
                                      if (trimmed === "" && (cIdx === 0 || cIdx === row.split('|').length - 1)) return null;
                                      return <td key={cIdx} className="px-3 py-2 text-zinc-300 font-mono">{trimmed}</td>;
                                    }).filter(Boolean)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      return <p key={idx} className="leading-relaxed whitespace-pre-line my-2">{paragraph}</p>;
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleFileSelect(previewFile.name);
                    setPreviewFile(null);
                  }}
                  className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/30 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <span>@ Reference in prompt</span>
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
