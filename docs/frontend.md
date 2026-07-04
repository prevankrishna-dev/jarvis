# Jarvis Frontend Implementation Documentation

The Jarvis frontend is built with **Next.js 16.2 (Turbopack)**, **React 19.2**, and **Tailwind CSS**. It is structured to run as a single-page console workspace router (`app/page.tsx`) with high-end glassmorphism layouts.

---

## 1. Key Components & Routing

- **`src/app/page.tsx`**: Manages top-level routing based on authentication states (`landing` | `login` | `console`). Credentials (`demo` / `demo123`) are stored locally.
- **`src/components/LandingPage.tsx`**: Provides an interactive introduction with preset domain cases (MSME, Law, Agency, Real Estate, Manufacturing) showing the public/private document indexes and demo queries.
- **`src/components/LoginPage.tsx`**: Features typing auto-fill animations and step-by-step connection sequences.
- **`src/components/ChatDashboard.tsx`**: The main workspace hub housing the document directory tree sidebar, PDF uploader, conversation logs, and settings panel.

---

## 2. API Communication Layer (`src/lib/api.ts`)

To keep backend connections modular, all data transfers are isolated inside `api.ts`. It provides a simple switch:

```typescript
// Set to true for mock presentation mode; set to false for real server integration
const USE_MOCK = false;
```

### Response Schema Contracts

```typescript
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
```

---

## 3. Custom UI Features

### A. Drag-and-Drop PDF Uploader
The document explorer contains a upload zone that supports drop events:
- **Events Bound**: `onDragOver`, `onDragEnter`, `onDragLeave`, and `onDrop`.
- **Active State Class**:
  ```tailwind
  border-indigo-500 bg-indigo-500/10 shadow-lg scale-[1.02]
  ```
- **Flow**: Drops PDF -> Calls `uploadDocument` -> Shows `UploadProgress` timer -> Succeeds -> Appends document node in sidebar tree -> Prints inline chat file indexed alert.

### B. Visual Shimmer Loading Skeleton
Instead of a simple text spinner, a full mock skeleton is displayed while `isTyping` is active:
- Built using the `.shimmer-bg` class (utilizing `@keyframes shimmer` in `globals.css` with a linear background translation).
- Renders:
  - 3 pulsing bouncing dots.
  - 3 text line shimmer blocks representing the response.
  - 2 citation card layout placeholders representing sources.

### C. Categorical Confidence Badges
Renders next to the Jarvis co-pilot author text based on the string confidence property:
- **`high`**: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- **`medium`**: `bg-amber-500/10 text-amber-400 border-amber-500/20`
- **`low`**: `bg-rose-500/10 text-rose-400 border-rose-500/20`

### D. Citation Cards with External Anchors
Citation blocks render source file details. If `url` is provided as a string:
- Renders a clickable anchor `<a>` tag highlighted in indigo with a custom external link icon `<svg>`.
- If `url` is `null`, renders plain text (e.g. for private certificates).
