export interface Source {
  name: string;
  excerpt: string;
  url: string | null;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  confidence: "high" | "medium" | "low";
}

export interface UploadResponse {
  filename: string;
  status: string;
  message: string;
}

// Config flag to toggle between mock data and the real backend
const USE_MOCK = false;
const BACKEND_URL = "http://localhost:8000";

// Mock responses matching the 5 demo questions
const MOCK_ANSWERS: Record<string, ChatResponse> = {
  dpiit: {
    answer: "Yes, you are highly eligible for the Startup India DPIIT recognition. Based on your uploaded **sample_business_plan.pdf**, your business is incorporated as a Private Limited Company (2024, Hyderabad) with a current turnover of ₹22 Lakhs, which is well below the ₹100 Crore limit. You meet all criteria outlined in the **Startup India DPIIT Guidelines**.",
    confidence: "high",
    sources: [
      {
        name: "Startup_India_DPIIT_Guidelines.pdf",
        excerpt: "DPIIT recognition is open to Private Limited Companies, Registered Partnerships, and LLCs. Your business must have a turnover below ₹100 Crore and be incorporated for less than 10 years.",
        url: "https://www.startupindia.gov.in/content/sih/en/startup-scheme.html",
        score: 0.88
      },
      {
        name: "sample_business_plan.pdf",
        excerpt: "Company Structure: Private Limited Company. Incorporation Date: Jan 12, 2024. Head Office: Hyderabad. Current Annual Turnover: ₹22,00,000.",
        url: null,
        score: 0.92
      }
    ]
  },
  risk: {
    answer: "Yes, there is a high-risk clause. In **Client_Vendor_Agreement.pdf (Clause 4.2)**, the client is allowed a 90-day payment term interest-free. Under MSME regulations (Delayed Payments Act), statutory payments must be cleared within 45 days. Signing this clause waives your interest claims and harms cash flow.",
    confidence: "high",
    sources: [
      {
        name: "Client_Vendor_Agreement.pdf",
        excerpt: "Clause 4.2 states: 'The Client reserves the right to delay payments up to 90 days from the invoice date without incurring interest charges...'",
        url: null,
        score: 0.85
      },
      {
        name: "MSME_Samadhaan_Delayed_Payments_Act.pdf",
        excerpt: "All buyers are mandated to pay MSME suppliers within 45 days. Any contract terms extending past 45 days are legally void, and penal interest of 3x RBI Bank Rate applies.",
        url: "https://samadhaan.msme.gov.in/MyMsme/mst/RulesRegulations.aspx",
        score: 0.81
      }
    ]
  },
  mudra: {
    answer: "According to live data fetched from **mudra.org.in**, the interest rates for MUDRA Tarun loans (funding between ₹5 Lakhs and ₹10 Lakhs) range between **9.25% and 12.15% per annum**. This rate is floating and tied to bank-specific MCLR/RLLR, which saw a minor 0.15% increase in the last quarter.",
    confidence: "high",
    sources: [
      {
        name: "Tavily Live Search: mudra.org.in/rates",
        excerpt: "MUDRA Tarun loans cover limits from ₹5 Lakhs to ₹10 Lakhs. Current interest rates depend on the lending bank, typically ranging between 9.25% to 12.15% per annum as of July 2026.",
        url: "https://www.mudra.org.in",
        score: 0.94
      }
    ]
  },
  women: {
    answer: "Women entrepreneurs in Telangana can leverage two major programs:\n1. **CGTMSE Scheme (National)**: Offers concession on guarantee fee + 85% credit coverage.\n2. **T-PRIDE (Telangana State)**: Offers a 9% interest subsidy on capital loans and 25% investment subsidy on fixed capital.",
    confidence: "high",
    sources: [
      {
        name: "CGTMSE_Guidelines.pdf",
        excerpt: "CGTMSE provides a 10% concessions on guarantee fees and guarantees up to 85% for women-led micro-enterprises.",
        url: "https://www.cgtmse.in",
        score: 0.83
      },
      {
        name: "T-PRIDE_Telangana_Scheme.pdf",
        excerpt: "T-PRIDE offers 9% interest subsidy on term loans and 25% investment subsidy on fixed capital for women SC/ST entrepreneurs.",
        url: "https://industries.telangana.gov.in",
        score: 0.79
      }
    ]
  },
  gst: {
    answer: "Based on your **sample_gst_registration.pdf** (regular taxpayer status), your business needs to complete the following compliance filings:\n1. **GSTR-1**: Monthly filing of outward supplies (sales) due on the 11th of each month.\n2. **GSTR-3B**: Monthly summary return & tax payment due on the 20th of each month.",
    confidence: "medium",
    sources: [
      {
        name: "GST_Compliance_Calendar.pdf",
        excerpt: "GSTR-1 (monthly filing of outward supplies) is due on the 11th of every month. GSTR-3B (monthly summary return) is due on the 20th of the following month.",
        url: "https://www.gst.gov.in",
        score: 0.75
      },
      {
        name: "sample_gst_registration.pdf",
        excerpt: "Taxpayer Type: Regular. GSTIN: 36AAAAA1111A1Z1. State Jurisdiction: Telangana.",
        url: null,
        score: 0.91
      }
    ]
  }
};

/**
 * Sends a chat query to the backend or simulates it locally.
 */
export async function sendChatQuery(
  query: string,
  businessId: string,
  threshold: number = 0.5
): Promise<ChatResponse> {
  if (USE_MOCK) {
    // Simulate ~1s network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lower = query.toLowerCase();
    let matchKey = "";
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

    if (matchKey && MOCK_ANSWERS[matchKey]) {
      const match = MOCK_ANSWERS[matchKey];
      // Compute the maximum match score to simulate confidence thresholding
      const maxScore = Math.max(...match.sources.map((s) => s.score), 0);
      
      if (maxScore < threshold) {
        return {
          answer: `I could not retrieve highly confident context to answer this query (Highest score: ${maxScore.toFixed(2)} < Threshold: ${threshold.toFixed(2)}). Please check the official source directly.`,
          sources: [],
          confidence: "low"
        };
      }

      // If score is high but threshold is very close, we can simulate medium
      const isMedium = maxScore >= threshold && maxScore < threshold + 0.15;
      return {
        ...match,
        confidence: isMedium ? "medium" : match.confidence
      };
    }

    // Default low confidence fallback
    return {
      answer: `I searched the public and private databases for '${query}', but could not find a confident answer. Please check the official source directly.`,
      sources: [],
      confidence: "low"
    };
  }

  // Real backend call
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      business_id: businessId,
      threshold
    })
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Uploads a document to the backend or simulates it locally.
 */
export async function uploadDocument(
  file: File,
  businessId: string
): Promise<UploadResponse> {
  if (USE_MOCK) {
    // Simulate ~1s network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      filename: file.name.toLowerCase(),
      status: "success",
      message: "Document indexed, ready to query"
    };
  }

  // Real backend call
  const formData = new FormData();
  formData.append("file", file);
  formData.append("business_id", businessId);

  const response = await fetch(`${BACKEND_URL}/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export interface FileItem {
  name: string;
  size: string;
}

export interface FolderItem {
  id: string;
  name: string;
  files: FileItem[];
}

export async function getFiles(): Promise<FolderItem[]> {
  if (USE_MOCK) {
    return [
      {
        id: "public",
        name: "public",
        files: [
          { name: "Startup_India_DPIIT_Guidelines.pdf", size: "312 KB" },
          { name: "MUDRA_Loan_Scheme_Details.pdf", size: "185 KB" }
        ]
      }
    ];
  }

  const response = await fetch(`${BACKEND_URL}/files`);
  if (!response.ok) {
    throw new Error(`Failed to fetch files list: ${response.statusText}`);
  }

  return response.json();
}
