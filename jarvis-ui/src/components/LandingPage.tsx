"use client";

import React, { useState, useEffect, useCallback } from "react";

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToConsole: () => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ onGoToLogin, onGoToConsole, isLoggedIn }: LandingPageProps) {
  // Pre-configured data matching the hackathon specifications
  const targetAudiences = [
    {
      id: "msme",
      name: "MSME & Startups",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      publicKb: [
        "PM Vishwakarma Scheme Guidelines.pdf",
        "MUDRA Loan Scheme Details.pdf",
        "Startup India DPIIT Recognition.pdf",
        "CGTMSE Credit Guarantee Guide.pdf",
        "Udyam Registration Rules.pdf",
      ],
      privateKb: [
        "Sample_Udyam_Certificate.pdf",
        "Sample_GST_Registration.pdf",
        "Sample_Business_Plan.pdf",
      ],
      questions: [
        "Based on my business plan, am I eligible for Startup India DPIIT recognition?",
        "What compliance filings does my GST-registered business need before quarter end?",
      ],
    },
    {
      id: "law",
      name: "Law Firms",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      publicKb: [
        "Companies Act 2013 Reference.pdf",
        "FEMA Regulations Handbook.pdf",
        "Standard Bar Council Compliance.pdf",
        "IPR Trademark Guidelines 2026.pdf",
      ],
      privateKb: [
        "Client_Vendor_Agreement.pdf",
        "Fictional_Founder_MOU.pdf",
        "Standard_NDA_Template.pdf",
      ],
      questions: [
        "I just uploaded a vendor agreement. Are there any payment clauses that could be risky?",
        "Does clause 7.3 of this NDA conflict with our standard template?",
      ],
    },
    {
      id: "agency",
      name: "Agencies & Freelancers",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      publicKb: [
        "GST Invoicing Guide for Services.pdf",
        "MSME Samadhaan Delayed Payments Act.pdf",
        "Freelancer Tax Deductions Guide.pdf",
      ],
      privateKb: [
        "Client_SOW_Glorx_Digital.pdf",
        "Q3_Outstanding_Invoices.pdf",
        "Standard_Service_Contract.pdf",
      ],
      questions: [
        "Which of my active contracts has a payment clause past 60 days?",
        "What are the interest rates if a client delays payment under MSME Samadhaan?",
      ],
    },
    {
      id: "realestate",
      name: "Real Estate",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      publicKb: [
        "RERA Act Guidelines 2016.pdf",
        "Telangana Zoning Laws Check.pdf",
        "Stamp Duty & Registration Rates.pdf",
      ],
      privateKb: [
        "Property_Sale_Deed_Draft.pdf",
        "Buyer_KYC_Verification.pdf",
        "NOC_Municipal_Corporation.pdf",
      ],
      questions: [
        "What RERA disclosures are required for this project in Telangana?",
        "Are there municipal NOC issues identified in the uploaded zoning map?",
      ],
    },
    {
      id: "manufacturing",
      name: "Manufacturing SMB",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      publicKb: [
        "BIS Quality Standards for MSMEs.pdf",
        "DGFT Import Export Policy 2026.pdf",
        "Factory Compliance & Labor Laws.pdf",
      ],
      privateKb: [
        "Supplier_Purchase_Order_24.pdf",
        "Factory_Audit_Report.pdf",
        "Supplier_Contract_TataSteel.pdf",
      ],
      questions: [
        "Which of our supplier contracts expire in the next 90 days?",
        "Are we compliant with the BIS standards for steel components based on our report?",
      ],
    },
  ];

  const demoQuestions = [
    {
      q: "Based on my business plan, am I eligible for Startup India DPIIT recognition?",
      score: 0.88,
      source: "Startup_India_DPIIT_Guidelines.pdf",
      excerpt:
        "DPIIT recognition is open to Private Limited Companies, Registered Partnerships, and LLCs. Your business must have a turnover below ₹100 Crore and be incorporated for less than 10 years. Your business plan lists private limited incorporation in Hyderabad (2024) and ₹22 Lakhs turnover, satisfying these conditions.",
      answer:
        "Yes, you are highly eligible for the Startup India DPIIT recognition. Based on your uploaded **Sample_Business_Plan.pdf**, your business is incorporated as a Private Limited Company (2024, Hyderabad) with a current turnover of ₹22 Lakhs, which is well below the ₹100 Crore limit. You meet all criteria outline in the **Startup India DPIIT Guidelines**.",
      warning:
        "Warning: Ensure your registration address matches your Udyam Aadhaar certificate exactly during the application.",
    },
    {
      q: "I just uploaded a vendor agreement. Are there any payment clauses that could be risky?",
      score: 0.82,
      source: "Client_Vendor_Agreement.pdf",
      excerpt:
        "Clause 4.2 states: 'The Client reserves the right to delay payments up to 90 days from the invoice date without incurring interest charges, notwithstanding any statutory provisions to the contrary.'",
      answer:
        "Yes, there is a high-risk clause. In **Client_Vendor_Agreement.pdf (Clause 4.2)**, the client is allowed a 90-day payment term interest-free. Under MSME regulations (Delayed Payments Act), statutory payments must be cleared within 45 days. Signing this clause waives your interest claims and harms cash flow.",
      warning:
        "Warning: This clause contradicts MSME statutory guidelines. Consider requesting amendment to a standard Net-30 or Net-45 term.",
    },
    {
      q: "What is the current interest rate for MUDRA Tarun loans and has it changed recently?",
      score: 0.94,
      source: "Tavily Live Web Search (mudra.org.in)",
      excerpt:
        "MUDRA Tarun loans cover limits from ₹5 Lakhs to ₹10 Lakhs. Current interest rates depend on the lending bank, typically ranging between 9.25% to 12.15% per annum as of July 2026, linked to the bank's Repo Linked Lending Rate (RLLR).",
      answer:
        "According to live data fetched from **mudra.org.in**, the interest rates for MUDRA Tarun loans (funding between ₹5 Lakhs and ₹10 Lakhs) range between **9.25% and 12.15% per annum**. This rate is floating and tied to bank-specific MCLR/RLLR, which saw a minor 0.15% increase in the last quarter.",
      warning:
        "Live Data Notice: Rates fluctuate by bank. Confirm the exact spread with SBI or SIDBI before submitting.",
    },
    {
      q: "Which government schemes support women-led businesses in Telangana right now?",
      score: 0.79,
      source: "CGTMSE Guidelines + Telangana TS-iPASS Guide",
      excerpt:
        "CGTMSE provides a 10% concessions on guarantee fees and guarantees up to 85% for women-led micro-enterprises. Additionally, Telangana's T-PRIDE scheme offers a 9% interest subsidy for women entrepreneurs.",
      answer:
        "Women entrepreneurs in Telangana can leverage two major programs: \n1. **CGTMSE Scheme (National)**: Offers concession on guarantee fee + 85% credit coverage. \n2. **T-PRIDE (Telangana State)**: Offers a 9% interest subsidy on capital loans and 25% investment subsidy on fixed capital.",
      warning:
        "Please verify eligibility guidelines on the TS-iPASS portal or the nearest DIC (District Industries Centre).",
    },
    {
      q: "What compliance filings does my GST-registered business need before quarter end?",
      score: 0.72,
      source: "GST Compliance Calendar Q3 2026",
      excerpt:
        "GSTR-1 (monthly filing of outward supplies) is due on the 11th of every month. GSTR-3B (monthly summary return) is due on the 20th of the following month. Quarterly return filers (QRMP) must submit IFF by the 13th.",
      answer:
        "Based on your **Sample_GST_Registration.pdf** (regular tax status), you must complete: \n1. **GSTR-1**: Filing of sales/outward supplies due on the 11th of each month. \n2. **GSTR-3B**: Tax payment & summary return due on the 20th of each month.",
      warning:
        "Standard Disclaimer: This is an advisory based on the standard GST calendar. Please cross-verify with your CA.",
    },
  ];

  // Component state
  const [activeAudience, setActiveAudience] = useState("msme");
  const [selectedQuestion, setSelectedQuestion] = useState(demoQuestions[0]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);
  const [isTyping, setIsTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(true);

  // New state variables for autoplay and sequential display modes
  const [viewMode, setViewMode] = useState<"player" | "stacked">("player");
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [autoplayTimeLeft, setAutoplayTimeLeft] = useState(4.0);

  // Helper for selecting questions manually
  const selectQuestionManually = (qObj: typeof demoQuestions[0]) => {
    setSelectedQuestion(qObj);
    setIsAutoplay(false);
  };

  // Autoplay Logic
  useEffect(() => {
    if (!isAutoplay || viewMode !== "player") {
      setAutoplayProgress(0);
      setAutoplayTimeLeft(4.0);
      return;
    }

    if (simulationComplete) {
      const duration = 4000; // 4 seconds
      const intervalTime = 50; // Update progress bar every 50ms
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += intervalTime;
        const ratio = Math.min(100, (elapsed / duration) * 100);
        setAutoplayProgress(ratio);
        setAutoplayTimeLeft(Math.max(0, (duration - elapsed) / 1000));

        if (elapsed >= duration) {
          clearInterval(timer);
          // Go to next question
          const currentIdx = demoQuestions.findIndex((dq) => dq.q === selectedQuestion.q);
          const nextIdx = (currentIdx + 1) % demoQuestions.length;
          setSelectedQuestion(demoQuestions[nextIdx]);
          // Re-trigger simulator state update
          setAutoplayProgress(0);
          setAutoplayTimeLeft(4.0);
        }
      }, intervalTime);

      return () => {
        clearInterval(timer);
      };
    } else {
      // Reset progress to 0 during typing/pipeline phase
      setAutoplayProgress(0);
      setAutoplayTimeLeft(4.0);
    }
  }, [isAutoplay, simulationComplete, selectedQuestion.q, viewMode]);

  // Navigation trigger

  const getResponseText = useCallback((questionObj: typeof demoQuestions[0], threshold: number) => {
    if (questionObj.score < threshold) {
      return `❌ RAG Pipeline Refusal (Score: ${questionObj.score} < Threshold: ${threshold})\n\n"I could not retrieve highly confident context to answer this query. To ensure security and compliance, Jarvis has blocked this answer to prevent hallucination. Please reference the official documentation directly or inspect your target documents: [${questionObj.source}]."`;
    } else if (threshold > 0.5 && questionObj.score < threshold + 0.15) {
      return `⚠️ Disclaimer Required (Score: ${questionObj.score} / Threshold: ${threshold})\n\n"${questionObj.answer}"\n\n[Caution] ${questionObj.warning}`;
    } else {
      return `✅ Grounded Response (Score: ${questionObj.score} / Threshold: ${threshold})\n\n"${questionObj.answer}"`;
    }
  }, []);

  const simulateRAGPipeline = useCallback((questionObj: typeof demoQuestions[0]) => {
    setIsTyping(true);
    setSimulationComplete(false);
    setCurrentStep(0);
    setTypedMessage("");

    // Step-by-step pipeline logging
    const stepIntervals = [
      setTimeout(() => setCurrentStep(1), 600), // Searching Public KB
      setTimeout(() => setCurrentStep(2), 1200), // Fetching Tavily
      setTimeout(() => setCurrentStep(3), 1800), // Querying Private KB
      setTimeout(() => {
        setCurrentStep(4);
        setIsTyping(false);
        // Start typing actual content
        let i = 0;
        const msg = getResponseText(questionObj, confidenceThreshold);
        const typingTimer = setInterval(() => {
          if (i < msg.length) {
            setTypedMessage(msg.slice(0, i + 2));
            i += 2;
          } else {
            clearInterval(typingTimer);
            setSimulationComplete(true);
          }
        }, 10);
      }, 2400),
    ];

    return () => {
      stepIntervals.forEach(clearTimeout);
    };
  }, [confidenceThreshold, getResponseText]);

  // Setup typing simulator when user changes the question
  useEffect(() => {
    const timer = setTimeout(() => {
      simulateRAGPipeline(selectedQuestion);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedQuestion, simulateRAGPipeline]);

  // Re-run simulation when threshold changes
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setConfidenceThreshold(val);
    setIsAutoplay(false); // Pause autoplay on manual threshold adjustment
    if (simulationComplete) {
      setTypedMessage(getResponseText(selectedQuestion, val));
    }
  };

  const audienceData = targetAudiences.find((a) => a.id === activeAudience) || targetAudiences[0];

  return (
    <div className="relative min-h-screen bg-[#EEF0F7] text-[#111827] radial-glow grid-bg overflow-hidden flex flex-col justify-between">
      {/* Glow shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#5B5FEF]/5 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#5B5FEF]/3 blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Navigation Top Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-[#E5E7EB] py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="gradient-brand w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg glow-indigo">
            J
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#111827] font-mono">JARVIS</span>
              <span className="bg-[#5B5FEF]/10 border border-[#5B5FEF]/20 text-[#5B5FEF] text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                RAG v1.0
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-[#374151]">
          <a href="#demo" className="hover:text-[#5B5FEF] transition-colors">Interactive Demo</a>
          <a href="#solutions" className="hover:text-[#5B5FEF] transition-colors">Target Verticals</a>
          <a href="#comparison" className="hover:text-[#5B5FEF] transition-colors">RAG Specs</a>

          {isLoggedIn ? (
            <button
              onClick={onGoToConsole}
              className="gradient-brand text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 text-sm cursor-pointer animate-pulse"
            >
              Go to Workspace
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onGoToLogin}
              className="gradient-brand text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 text-sm cursor-pointer"
            >
              Login to Console
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </nav>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex-1 flex flex-col gap-20 relative z-10">

        {/* Hero Copy & Presentation Block */}
        <section className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto min-h-[70vh] justify-center py-12">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight gradient-text animate-fade-in-up">
            Meet Jarvis.<br />
            <span className="text-[#5B5FEF]">AI Business Intelligence</span><br />
            For Any Domain.
          </h1>

          <p className="text-[#374151] text-lg md:text-xl leading-relaxed max-w-2xl animate-fade-in-up animation-delay-100">
            A dual-layer Retrieval-Augmented Generation (RAG) assistant designed for businesses.
            Jarvis securely indexes your private documents and merges them with live government, compliance,
            and web data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2 animate-fade-in-up animation-delay-200 justify-center w-full sm:w-auto">
            <button
              onClick={isLoggedIn ? onGoToConsole : onGoToLogin}
              className="gradient-brand text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-95 shadow-lg shadow-[#5B5FEF]/10 transition-all hover:scale-[1.03] flex items-center justify-center gap-3 text-base glow-indigo w-full sm:w-auto cursor-pointer"
            >
              Enter Workspace Console
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </section>

        {/* Interactive RAG Simulation */}
        <section id="demo" className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in-up animation-delay-300">
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative border border-[#E5E7EB]">
            {/* Window bar */}
            <div className="bg-[#E6E9F2] border-b border-[#E5E7EB] px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-[#6B7280] font-mono ml-2">jarvis-rag-simulator:~</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-[#374151] font-mono">Gemini-1.5-Flash Active</span>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="bg-[#F0F2F9] border-b border-[#E5E7EB] px-4 py-2 flex gap-2">
              <button
                onClick={() => setViewMode("player")}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${viewMode === "player"
                  ? "bg-[#5B5FEF] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-zinc-200/60"
                  }`}
              >
                🎮 Interactive Player
              </button>
              <button
                onClick={() => setViewMode("stacked")}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${viewMode === "stacked"
                  ? "bg-[#5B5FEF] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-zinc-200/60"
                  }`}
              >
                📋 Show All Stacked
              </button>
            </div>

            {/* RAG Controls & Status */}
            <div className="p-4 md:p-6 bg-[#EEF0F7]/95 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-6">

              {viewMode === "player" ? (
                /* Question selector */
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2 font-mono">
                    Select Question to Demo
                  </label>
                  <div className="relative">
                    <select
                      value={selectedQuestion.q}
                      onChange={(e) => {
                        const qObj = demoQuestions.find((dq) => dq.q === e.target.value);
                        if (qObj) selectQuestionManually(qObj);
                      }}
                      className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-[#5B5FEF]/50 appearance-none font-sans shadow-sm"
                    >
                      {demoQuestions.map((q, idx) => (
                        <option key={idx} value={q.q}>
                          Q{idx + 1}: {q.q.slice(0, 50)}...
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B7280]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Autoplay & Navigation Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setIsAutoplay(!isAutoplay)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-sm cursor-pointer ${isAutoplay
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                    >
                      {isAutoplay ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Pause Autoplay
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Play Autoplay
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const currentIdx = demoQuestions.findIndex((dq) => dq.q === selectedQuestion.q);
                        const prevIdx = (currentIdx - 1 + demoQuestions.length) % demoQuestions.length;
                        selectQuestionManually(demoQuestions[prevIdx]);
                      }}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-zinc-50 shadow-sm cursor-pointer"
                      title="Previous Question"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => {
                        const currentIdx = demoQuestions.findIndex((dq) => dq.q === selectedQuestion.q);
                        const nextIdx = (currentIdx + 1) % demoQuestions.length;
                        selectQuestionManually(demoQuestions[nextIdx]);
                      }}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-zinc-50 shadow-sm cursor-pointer"
                      title="Next Question"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* Header indicating stacked view */
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#111827] font-sans">All Demonstrations Feed</h4>
                  <p className="text-xs text-[#6B7280] font-mono mt-0.5">Showing Q1 to Q5 processed simultaneously</p>
                </div>
              )}

              {/* Slider for Confidence Thresholding */}
              <div className="w-full md:w-60">
                <div className="flex justify-between items-center mb-1 font-mono">
                  <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Confidence Cutoff
                  </label>
                  <span className={`text-xs font-bold ${confidenceThreshold > 0.8 ? "text-rose-600" : confidenceThreshold > 0.6 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                    {confidenceThreshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.40"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={handleThresholdChange}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#5B5FEF]"
                />
                <div className="flex justify-between text-[9px] text-[#6B7280] font-mono mt-1">
                  <span>0.40 (Lenient)</span>
                  <span>0.70 (Standard)</span>
                  <span>0.95 (Strict)</span>
                </div>
              </div>
            </div>

            {/* Autoplay Progress Bar */}
            {isAutoplay && viewMode === "player" && (
              <div className="bg-indigo-50/80 border-b border-[#E5E7EB] px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#5B5FEF]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] animate-ping" />
                  <span>
                    {simulationComplete
                      ? `Autoplay active: Next demo in ${autoplayTimeLeft.toFixed(1)}s`
                      : "Autoplay active: Processing current query..."}
                  </span>
                </div>
                {simulationComplete && (
                  <div className="w-32 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5B5FEF] h-full transition-all duration-75"
                      style={{ width: `${autoplayProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Simulated Chat Interface or Stacked View */}
            {viewMode === "player" ? (
              <div className="p-4 md:p-6 min-h-[340px] flex flex-col justify-between gap-6 bg-[#E6E9F2]/50">

                {/* Question bubble */}
                <div className="flex flex-col gap-2 self-end max-w-[85%]">
                  <div className="text-[10px] text-[#6B7280] font-mono self-end">USER QUERY</div>
                  <div className="bg-gradient-to-br from-[#1E1B4B] to-[#5B5FEF] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-md shadow-[#5B5FEF]/5 font-sans leading-relaxed">
                    {selectedQuestion.q}
                  </div>
                </div>

                {/* RAG pipeline execution step visualizer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { label: "ChromaDB: Public", activeStep: 1 },
                    { label: "Tavily: Live Search", activeStep: 2 },
                    { label: "ChromaDB: Private", activeStep: 3 },
                    { label: "Gemini: Generation", activeStep: 4 },
                  ].map((step, idx) => {
                    const isChecked = currentStep >= step.activeStep;
                    const isCurrent = currentStep === step.activeStep - 1 && isTyping;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${isChecked
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                          : isCurrent
                            ? "bg-[#5B5FEF]/5 border-[#5B5FEF]/20 text-[#5B5FEF] animate-pulse"
                            : "bg-white/40 border-[#E5E7EB] text-[#6B7280]"
                          }`}
                      >
                        {isChecked ? (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-[#5B5FEF] animate-ping shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" />
                        )}
                        <span className="truncate">{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Bot response block */}
                <div className="flex flex-col gap-2 self-start w-full">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="gradient-brand w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white">
                        J
                      </span>
                      <span className="text-[10px] text-[#6B7280] font-mono">JARVIS RAG ENGINE</span>
                    </div>

                    {/* Confidence Badge */}
                    {simulationComplete && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${selectedQuestion.score < confidenceThreshold
                        ? "bg-rose-500/5 border-rose-500/20 text-rose-600"
                        : selectedQuestion.score >= 0.85
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                          : "bg-amber-500/5 border-amber-500/20 text-amber-600"
                        }`}>
                        Confidence: {selectedQuestion.score.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-[#E5E7EB] text-[#111827] px-5 py-4 rounded-2xl rounded-tl-sm text-sm shadow-md shadow-zinc-900/5 font-mono leading-relaxed min-h-[140px] whitespace-pre-wrap">
                    {isTyping ? (
                      <div className="flex items-center gap-1 text-[#6B7280] py-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-1 text-xs">Retrieving & generating grounded answer...</span>
                      </div>
                    ) : (
                      typedMessage
                    )}
                  </div>
                </div>



              </div>
            ) : (
              /* Stacked View: displaying all 5 demonstrations one after another */
              <div className="p-4 md:p-6 max-h-[580px] overflow-y-auto flex flex-col gap-6 bg-[#E6E9F2]/50 scrollbar-thin">
                {demoQuestions.map((q, idx) => (
                  <div key={idx} className="flex flex-col gap-4 p-5 bg-white/70 border border-[#E5E7EB] rounded-2xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[#E5E7EB]/60 pb-2">
                      <span className="text-xs font-mono font-bold text-[#5B5FEF]">DEMONSTRATION {idx + 1}</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                        Score: {q.score.toFixed(2)}
                      </div>
                    </div>

                    {/* Question */}
                    <div className="flex flex-col gap-1 max-w-[85%] self-end">
                      <div className="text-[9px] text-[#6B7280] font-mono self-end">USER QUERY</div>
                      <div className="bg-gradient-to-br from-[#1E1B4B] to-[#5B5FEF] text-white px-4 py-2.5 rounded-xl rounded-tr-sm text-xs shadow-sm font-sans leading-relaxed">
                        {q.q}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px] font-mono">
                      {[
                        { label: "ChromaDB: Public" },
                        { label: "Tavily: Live Search" },
                        { label: "ChromaDB: Private" },
                        { label: "Gemini: Generation" },
                      ].map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-600">
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{step.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Output */}
                    <div className="flex flex-col gap-1.5 self-start w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="gradient-brand w-4.5 h-4.5 rounded flex items-center justify-center font-bold text-[9px] text-white">J</span>
                        <span className="text-[9px] text-[#6B7280] font-mono">JARVIS RAG ENGINE</span>
                      </div>
                      <div className="bg-white border border-[#E5E7EB] text-[#111827] px-4 py-3 rounded-xl rounded-tl-sm text-xs font-mono leading-relaxed whitespace-pre-wrap shadow-sm">
                        {getResponseText(q, confidenceThreshold)}
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Segment 2: Target Verticals (Faceted Solutions) */}
      <section id="solutions" className="bg-white border-y border-[#E5E7EB] py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">

          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-bold text-[#5B5FEF] tracking-widest uppercase font-mono">
              Faceted Intelligence
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827]">
              One Pipeline. Infinite Verticals.
            </h2>
            <p className="text-[#374151] text-sm md:text-base leading-relaxed">
              Jarvis is architected to be domain-agnostic. Switching domain databases re-scopes the assistant&apos;s intelligence, supporting multiple sectors seamlessly.
            </p>
          </div>

          {/* Vertical switcher tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {targetAudiences.map((audience) => (
              <button
                key={audience.id}
                onClick={() => {
                  setActiveAudience(audience.id);
                  // Pick first question from this audience to simulate
                  const firstQ = demoQuestions.find((dq) => dq.q === audience.questions[0]);
                  if (firstQ) selectQuestionManually(firstQ);
                }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all text-left ${activeAudience === audience.id
                  ? "bg-[#5B5FEF]/5 border-[#5B5FEF]/30 text-[#5B5FEF] shadow-sm"
                  : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-zinc-50 hover:text-[#111827]"
                  }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeAudience === audience.id ? "bg-[#5B5FEF]/10 text-[#5B5FEF]" : "bg-zinc-100 text-[#6B7280]"
                  }`}>
                  {audience.icon}
                </div>
                <span>{audience.name}</span>
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-4">

            {/* Files list */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Dual Knowledge Bases</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Preloaded & user documents representing this vertical</p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#5B5FEF] uppercase tracking-widest font-mono mb-2">
                    Public KB (Pre-indexed)
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {audienceData.publicKb.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-[#374151] bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6l-4-4H9z" />
                          <path d="M5 6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1h-2v1H5V8h1V6H5z" />
                        </svg>
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#5B5FEF] uppercase tracking-widest font-mono mb-2">
                    Private KB (User uploads)
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {audienceData.privateKb.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-[#374151] bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0112 2.586L15.414 6a1 1 0 011 6.586V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Example Queries */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col gap-6 justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Example RAG Queries</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Click any standard question to simulate retrieval pipeline in the terminal above</p>
              </div>

              <div className="flex flex-col gap-3 my-4">
                {audienceData.questions.map((q, idx) => {
                  const match = demoQuestions.find((dq) => dq.q === q);
                  const isSelected = selectedQuestion.q === q;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (match) selectQuestionManually(match);
                      }}
                      disabled={!match}
                      className={`text-left text-sm p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${isSelected
                        ? "bg-[#5B5FEF]/5 border-[#5B5FEF]/20 text-[#111827] font-medium shadow-sm"
                        : match
                          ? "bg-zinc-50 border-[#E5E7EB] text-[#374151] hover:bg-zinc-100 hover:text-[#111827]"
                          : "opacity-40 cursor-not-allowed bg-zinc-100 border-transparent text-zinc-400"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono ${isSelected ? "bg-indigo-600 text-white" : "bg-zinc-200 text-[#6B7280]"
                          }`}>
                          Q{idx + 1}
                        </span>
                        <span className="font-medium">{q}</span>
                      </div>
                      {match && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-mono shrink-0">
                          <span>Simulate</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex gap-3 items-center shadow-sm">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-[#5B5FEF]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-[#374151] leading-normal">
                  In live-execution mode, queries are routed through a FastAPI orchestrator that extracts vectors, queries ChromaDB collections, executes Tavily search web calls, and renders answers.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Segment 3: RAG vs Standard ChatGPT comparison */}
      <section id="comparison" className="max-w-7xl mx-auto px-6 md:px-12 py-20 relative z-10 w-full bg-transparent">
        <div className="flex flex-col gap-12">

          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-bold text-[#5B5FEF] tracking-widest uppercase font-mono">
              Technology Justification
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827]">
              Why Dual RAG Beats Raw LLMs
            </h2>
            <p className="text-[#374151] text-sm md:text-base leading-relaxed">
              Standard LLM document analysis forgets uploads when sessions terminate and lacks real-time awareness. Jarvis implements persistent double knowledge caches.
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-[#E5E7EB] text-xs text-[#6B7280] font-mono uppercase">
                  <th className="p-4 md:p-5 font-bold">Feature Metric</th>
                  <th className="p-4 md:p-5 font-bold">Generic ChatGPT / Upload</th>
                  <th className="p-4 md:p-5 font-bold text-[#111827] bg-[#5B5FEF]/5">Jarvis Dual RAG (Local)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
                {[
                  {
                    name: "Document Persistence",
                    gpt: "Lost when chat session ends",
                    jarvis: "Indexed in ChromaDB forever, shared across sessions",
                    highlight: true,
                  },
                  {
                    name: "Data Scope Limit",
                    gpt: "Breaks down beyond ~50 pages (context cap)",
                    jarvis: "Vector index scales to thousands of documents",
                    highlight: false,
                  },
                  {
                    name: "Live Compliance Updates",
                    gpt: "Static training data cutoff",
                    jarvis: "Tavily fetches live regulatory guidelines",
                    highlight: true,
                  },
                  {
                    name: "Source Citation Guarantee",
                    gpt: "Inconsistent, prone to hallucinations",
                    jarvis: "Cites exact source document, paragraph, & score",
                    highlight: false,
                  },
                  {
                    name: "Confidence Thresholding",
                    gpt: "Will guess confidently even when wrong",
                    jarvis: "Refuses to answer if retrieval score < setting",
                    highlight: true,
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 md:p-5 font-semibold text-[#111827]">{row.name}</td>
                    <td className="p-4 md:p-5 text-[#6B7280]">{row.gpt}</td>
                    <td className={`p-4 md:p-5 font-medium ${row.highlight ? "text-[#5B5FEF] font-bold" : "text-[#111827]"
                      } bg-[#5B5FEF]/5`}>
                      {row.jarvis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick CTA banner */}
          <div className="bg-gradient-to-r from-indigo-50/20 to-indigo-100/20 border border-indigo-100/30 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-[#111827]">Ready to test the interactive workspace?</h3>
              <p className="text-[#374151] text-xs md:text-sm">
                Upload business certificates, review agreements, and inspect system prompt logic in real-time.
              </p>
            </div>
            <button
              onClick={isLoggedIn ? onGoToConsole : onGoToLogin}
              className="gradient-brand text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-95 shadow-md transition-all hover:scale-[1.03] shrink-0 flex items-center gap-2 text-sm md:text-base cursor-pointer"
            >
              Launch Dashboard UI
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="glass-panel border-t border-[#E5E7EB] py-8 px-6 text-center text-xs text-[#6B7280] font-mono">
        <p>© 2026 JARVIS Assistant Reserved</p>
        <p className="mt-1 text-[#6B7280]">Built using Next.js, FastAPI, LangChain, ChromaDB & Gemini 1.5 Flash</p>
      </footer>
    </div>
  );
}
