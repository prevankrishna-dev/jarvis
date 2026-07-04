"use client";

import React, { useState, useRef, useEffect } from "react";

// Types
interface Message {
  sender: "user" | "antigravity";
  text: string;
  timestamp: string;
  thought?: string;
  commands?: { cmd: string; status: "success" | "running" | "pending" }[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface Subagent {
  id: string;
  name: string;
  role: string;
  prompt: string;
  status: "idle" | "running" | "done";
  logs: string[];
}

// Tree Node for File Explorer
interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
}

export default function AntigravityClone() {
  // App States
  const [selectedModel, setSelectedModel] = useState("Gemini 3.5 Flash (High)");
  const [activeTab, setActiveTab] = useState<"tasks" | "artifacts" | "subagents" | "terminals" | "editor">("tasks");
  const [activeConversationId, setActiveConversationId] = useState("3");
  const [newChatInput, setNewChatInput] = useState("");
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [runningStep, setRunningStep] = useState("");
  
  // Folder Expand/Collapse state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "root": true,
    "jarvis-ui": true,
    "jarvis-ui/src": true,
    "jarvis-ui/src/components": true,
  });

  // Editor states
  const [editorFile, setEditorFile] = useState<string>("jarvis-ui/src/components/AntigravityClone.tsx");
  const [editorContent, setEditorContent] = useState<string>("// Select a file from the explorer to view its contents");

  // Terminal states
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Microsoft Windows [Version 10.0.22631.3880]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "Loading Antigravity agent shell...",
    "Agent connected on workspace: c:\\Users\pullu\\Desktop\\jarvis",
    "Running inside sandboxed environment: docker-sandbox-129",
    "Type 'help' to see available mock commands.",
    ""
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Subagents states
  const [subagents, setSubagents] = useState<Subagent[]>([
    {
      id: "sa-1",
      name: "researcher-1",
      role: "Codebase Researcher",
      prompt: "Find all instances of custom tailwind themes in globals.css.",
      status: "done",
      logs: [
        "Initializing subagent: researcher-1 (Codebase Researcher)...",
        "Searching directory: jarvis-ui/src...",
        "Match found: src/app/globals.css line 45 - '.gradient-text'",
        "Match found: src/app/globals.css line 51 - '.gradient-brand'",
        "Reporting findings back to parent Antigravity agent.",
        "Subagent terminated successfully."
      ]
    }
  ]);
  const [newSubagentName, setNewSubagentName] = useState("");
  const [newSubagentRole, setNewSubagentRole] = useState("Codebase Researcher");
  const [newSubagentPrompt, setNewSubagentPrompt] = useState("");

  // Checklist Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", text: "Analyze jarvis-ui Next.js structure and Tailwind config", done: true },
    { id: "t2", text: "Create /antigravity page route in app directory", done: true },
    { id: "t3", text: "Design high-fidelity AntigravityClone component layout", done: true },
    { id: "t4", text: "Implement collapsible Left Sidebar Folder Tree dropdowns", done: false },
    { id: "t5", text: "Add Conversation History switching and New Chat launcher", done: false },
    { id: "t6", text: "Build Right Panel (Tasks list, Artifacts, Terminal commands, Diff Viewer)", done: false },
    { id: "t7", text: "Verify UI responsive styling and interactions", done: false },
  ]);

  // Selected Artifact
  const [activeArtifactId, setActiveArtifactId] = useState<"plan" | "walkthrough" | "task">("plan");

  // Mock Conversations database
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Simple Login Page Implementation",
      messages: [
        {
          sender: "user",
          text: "Can you create a custom login page for our hackathon project? It needs auto-fill buttons so the judges don't have to type anything.",
          timestamp: "Today, 07:28 AM"
        },
        {
          sender: "antigravity",
          timestamp: "Today, 07:29 AM",
          thought: "The user is building a hackathon prototype called Jarvis. A premium login page with keyboard auto-fill simulation would give the judges a great impression. I will write LoginPage.tsx with styled glassmorphism and an automated keyboard typing simulation for the 'demo/demo123' credentials.",
          commands: [
            { cmd: "npm run build --prefix jarvis-ui", status: "success" }
          ],
          text: "I have implemented a gorgeous glassmorphism Login Page with keyboard typing animations under [LoginPage.tsx](file:///c:/Users/pullu/Desktop/jarvis/jarvis-ui/src/components/LoginPage.tsx). \n\n### Highlights:\n1. **Glassmorphism Theme**: Uses a dark zinc palette with subtle indigo/cyan radial glows and translucent borders.\n2. **Vibrancy & Interaction**: Added high-quality hover animations and error alert animations (shaking card and haptic device vibration).\n3. **One-Click Auto-Fill**: Simulated keyboard typing for the username and password fields at the click of a button, letting judges launch the console without tedious typing."
        }
      ]
    },
    {
      id: "2",
      title: "Project Dependency Summary",
      messages: [
        {
          sender: "user",
          text: "What Python dependencies do we need to set up on our machines for the RAG backend?",
          timestamp: "Today, 07:11 AM"
        },
        {
          sender: "antigravity",
          timestamp: "Today, 07:12 AM",
          thought: "The backend will use LangChain, ChromaDB, Tavily, and FastAPI. Let's summarize the standard pip packages and draft a shell script for quick installation.",
          text: "Here is the list of Python dependencies required for the **Jarvis Dual RAG pipeline**:\n\n```bash\npip install langchain langchain-google-genai langchain-community\npip install chromadb pymupdf tavily-python fastapi uvicorn python-multipart\n```\n\n### Key Packages:\n- **langchain**: Chains together retrieval and generation steps.\n- **chromadb**: Light, local vector store requiring zero cloud configuration.\n- **pymupdf (fitz)**: Super-fast extraction of text from uploaded business PDFs.\n- **tavily-python**: Clean live web search API custom-made for agentic LLMs.\n- **fastapi & uvicorn**: Hosts the REST endpoints called by Next.js."
        }
      ]
    },
    {
      id: "3",
      title: "Antigravity Frontend Clone",
      messages: [
        {
          sender: "user",
          text: "as a reference for the frontend clone yourself exactly. with exact nav bar , side bar with conversations, conversation history, new chat, folders and when u click down i need the files for the folders as dropdown.",
          timestamp: "Today, 01:28 PM"
        },
        {
          sender: "antigravity",
          timestamp: "Today, 01:30 PM",
          thought: "I need to clone my own Antigravity 2.0 interface. This requires planning and building the Next.js page route (`/antigravity`) and the interactive workspace dashboard. I will structure the Left Sidebar with a fully functioning directory dropdown, conversation switcher, New Chat loader, and the Right HTML Panel containing tasks, artifacts, terminals, and code editors. Let's outline the plan and execute it.",
          commands: [
            { cmd: "mkdir jarvis-ui/src/app/antigravity", status: "success" },
            { cmd: "touch jarvis-ui/src/app/antigravity/page.tsx", status: "success" },
            { cmd: "touch jarvis-ui/src/components/AntigravityClone.tsx", status: "success" }
          ],
          text: "I am building a high-fidelity, pixel-perfect clone of myself (the Antigravity 2.0 developer interface) inside your project. \n\nI have set up the page route [page.tsx](file:///c:/Users/pullu/Desktop/jarvis/jarvis-ui/src/app/antigravity/page.tsx) and am implementing the core workspace dashboard under [AntigravityClone.tsx](file:///c:/Users/pullu/Desktop/jarvis/jarvis-ui/src/components/AntigravityClone.tsx).\n\n### Core Cloned Features:\n1. **Dynamic Left Sidebar**: \n   - **Folder Explorer Dropdown**: Lists your workspace files recursively. Click folders to open their contents. Click files to open them in the simulated right-hand editor.\n   - **Conversation History**: Lets you switch between past threads or click **New Chat** to start a clean interactive prompt.\n2. **Top Status Bar**: Brand labels, model selector dropdown, sandboxing environment flags, and active token usage counters.\n3. **Central Chat Canvas**: Displays my thinking blocks (`<thought>`), terminal logs, and response streams.\n4. **Right HTML Panel**: Integrates tab interfaces for checking Checklist items, viewing markdown plans, running mock shell terminal commands, spawning subagents, and inspecting git file diffs."
        }
      ]
    }
  ]);

  // Mock Workspace Files Database for the explorer
  const fileSystem: FileNode = {
    name: "jarvis",
    type: "folder",
    path: "root",
    children: [
      {
        name: ".venv",
        type: "folder",
        path: ".venv",
        children: [
          { name: "pyvenv.cfg", type: "file", path: ".venv/pyvenv.cfg", content: "home = C:\\Python312\ninclude-system-site-packages = false\nversion = 3.12.3" },
          { name: "pip-selfcheck.json", type: "file", path: ".venv/pip-selfcheck.json", content: '{"timestamp": 1720078345, "version": "24.0"}' }
        ]
      },
      {
        name: "jarvis-ui",
        type: "folder",
        path: "jarvis-ui",
        children: [
          {
            name: "src",
            type: "folder",
            path: "jarvis-ui/src",
            children: [
              {
                name: "app",
                type: "folder",
                path: "jarvis-ui/src/app",
                children: [
                  {
                    name: "antigravity",
                    type: "folder",
                    path: "jarvis-ui/src/app/antigravity",
                    children: [
                      { name: "page.tsx", type: "file", path: "jarvis-ui/src/app/antigravity/page.tsx", content: 'import React from "react";\nimport AntigravityClone from "@/components/AntigravityClone";\n\nexport default function AntigravityPage() {\n  return <AntigravityClone />;\n}' }
                    ]
                  },
                  { name: "globals.css", type: "file", path: "jarvis-ui/src/app/globals.css", content: '@import "tailwindcss";\n\n:root {\n  --background: #0a0a0a;\n  --foreground: #f4f4f5;\n  --card-bg: rgba(20, 20, 25, 0.6);\n  --border-color: rgba(255, 255, 255, 0.08);\n}\n\nbody {\n  background-color: var(--background);\n  color: var(--foreground);\n}' },
                  { name: "layout.tsx", type: "file", path: "jarvis-ui/src/app/layout.tsx", content: 'import type { Metadata } from "next";\nimport "./globals.css";\n\nexport const metadata: Metadata = {\n  title: "Jarvis - AI Business Intelligence",\n  description: "RAG Assistant for business documents",\n};\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body className="antialiased">{children}</body>\n    </html>\n  );\n}' },
                  { name: "page.tsx", type: "file", path: "jarvis-ui/src/app/page.tsx", content: '"use client";\nimport React, { useState } from "react";\nimport LandingPage from "@/components/LandingPage";\nimport ChatDashboard from "@/components/ChatDashboard";\nimport LoginPage from "@/components/LoginPage";' }
                ]
              },
              {
                name: "components",
                type: "folder",
                path: "jarvis-ui/src/components",
                children: [
                  { name: "AntigravityClone.tsx", type: "file", path: "jarvis-ui/src/components/AntigravityClone.tsx", content: '"use client";\nimport React, { useState } from "react";\n// Google Antigravity 2.0 UI exact clone...' },
                  { name: "ChatDashboard.tsx", type: "file", path: "jarvis-ui/src/components/ChatDashboard.tsx", content: '"use client";\nimport React, { useState } from "react";\n// Jarvis BI console dashboard code...' },
                  { name: "LandingPage.tsx", type: "file", path: "jarvis-ui/src/components/LandingPage.tsx", content: '"use client";\nimport React, { useState } from "react";\n// Landing Page marketing grid & interactive preview code...' },
                  { name: "LoginPage.tsx", type: "file", path: "jarvis-ui/src/components/LoginPage.tsx", content: '"use client";\nimport React, { useState } from "react";\n// LoginPage component with simulated typing script...' }
                ]
              }
            ]
          },
          { name: "package.json", type: "file", path: "jarvis-ui/package.json", content: '{\n  "name": "jarvis-ui",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build"\n  },\n  "dependencies": {\n    "next": "16.2.10",\n    "react": "19.2.4",\n    "react-dom": "19.2.4"\n  }\n}' },
          { name: "tsconfig.json", type: "file", path: "jarvis-ui/tsconfig.json", content: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true\n  }\n}' }
        ]
      },
      { name: "jarvis-hackathon.md", type: "file", path: "jarvis-hackathon.md", content: "# JARVIS\nYour AI-Powered Business Intelligence Assistant\n\n### 1. Problem Statement\nEvery business drowns in documents..." },
      { name: "AGENTS.md", type: "file", path: "AGENTS.md", content: "# Project Agent Rules\nStyle guidelines, architectural guidelines, and constraints for the Jarvis Hackathon app." }
    ]
  };

  // Set default content for editor on mount
  useEffect(() => {
    // Find initial content of AntigravityClone
    const findFile = (node: FileNode, path: string): string | null => {
      if (node.path === path && node.content) return node.content;
      if (node.children) {
        for (const child of node.children) {
          const res = findFile(child, path);
          if (res) return res;
        }
      }
      return null;
    };
    const c = findFile(fileSystem, "jarvis-ui/src/components/AntigravityClone.tsx");
    if (c) setEditorContent(c);
  }, []);

  // Scroll terminal logs to bottom when updated
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Expand/Collapse folder tree toggle handler
  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Folder Explorer click handler
  const handleExplorerClick = (node: FileNode) => {
    if (node.type === "folder") {
      toggleFolder(node.path);
    } else {
      setEditorFile(node.path);
      setEditorContent(node.content || `// Content of ${node.name}`);
      setActiveTab("editor"); // auto switch to editor tab when file clicked
    }
  };

  // Task list checkbox handler
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Submit User prompt (chat simulator)
  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim() || isAgentRunning) return;

    const input = newChatInput;
    setNewChatInput("");
    setIsAgentRunning(true);

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    const updatedMsgs: Message[] = [
      ...conversations.find((c) => c.id === activeConversationId)?.messages || [],
      { sender: "user", text: input, timestamp }
    ];

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, messages: updatedMsgs } : c))
    );

    // Simulate Agent Step tracing
    setRunningStep("thinking");
    setTerminalLogs((prev) => [...prev, `[system] User prompt received: "${input}"`, "[system] Launching Antigravity reasoning loop..."]);

    setTimeout(() => {
      setRunningStep("executing");
      setTerminalLogs((prev) => [...prev, "Checking database configuration...", "Running command: npm run build --prefix jarvis-ui"]);
    }, 1500);

    setTimeout(() => {
      setRunningStep("responding");
      setTerminalLogs((prev) => [...prev, "Build success. Formulating response..."]);
    }, 3000);

    setTimeout(() => {
      // Append agent response
      const agentMsg: Message = {
        sender: "antigravity",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        thought: `The user wants me to process: '${input}'. I should explain how the codebase handles this logic and show any simulated terminal steps taken.`,
        commands: [
          { cmd: "npm run build --prefix jarvis-ui", status: "success" }
        ],
        text: `I have simulated the agent run successfully!\n\n**Processed Action**: "${input}"\n\n**Pipeline Output**:\n- **Workspace context verified** inside docker sandbox.\n- **Compilation checked** against Next.js pages.\n- **Status**: Live & Ready for validation.\n\nLet me know if you would like me to modify any specific component or edit configuration scripts!`
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...updatedMsgs, agentMsg] }
            : c
        )
      );

      setIsAgentRunning(false);
      setRunningStep("");
      setTerminalLogs((prev) => [...prev, "[system] Antigravity response completed.", ""]);
    }, 4500);
  };

  // Launch New Chat
  const handleNewChat = () => {
    const newId = String(conversations.length + 1);
    const newTitle = `Conversation ${newId}`;
    const newConv: Conversation = {
      id: newId,
      title: newTitle,
      messages: [
        {
          sender: "antigravity",
          text: "Hello! I am Google Antigravity, your AI-first coding assistant. How can I help you build or debug your workspace today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]
    };
    setConversations((prev) => [...prev, newConv]);
    setActiveConversationId(newId);
    setTerminalLogs((prev) => [...prev, `[system] Started new conversation thread: "${newTitle}"`, ""]);
  };

  // Handle Terminal CLI inputs (interactive shell)
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const updatedLogs = [...terminalLogs, `C:\\Users\\pullu\\Desktop\\jarvis> ${cmd}`];
    
    switch (cmd.toLowerCase()) {
      case "help":
        updatedLogs.push(
          "Available Mock Commands:",
          "  ls           - List files in current workspace directory",
          "  git status   - View current branch and changes",
          "  npm run dev  - Simulate running Next.js development server",
          "  clear        - Clear the terminal screen",
          "  whoami       - Display active agent identity info",
          "  model        - Print active Gemini model details"
        );
        break;
      case "ls":
        updatedLogs.push(
          "Directory listing for c:\\Users\\pullu\\Desktop\\jarvis:",
          "  .venv/               <DIR>  2026-07-04 13:28",
          "  jarvis-ui/           <DIR>  2026-07-04 13:28",
          "  AGENTS.md             327 B 2026-07-04 13:28",
          "  jarvis-hackathon.md 32.3 KB 2026-07-04 13:28"
        );
        break;
      case "git status":
        updatedLogs.push(
          "On branch main",
          "Your branch is up to date with 'origin/main'.",
          "",
          "Changes not staged for commit:",
          "  (use \"git add <file>...\" to update what will be committed)",
          "  (use \"git restore <file>...\" to discard changes in working directory)",
          "        modified:   jarvis-ui/src/components/LandingPage.tsx",
          "",
          "Untracked files:",
          "  (use \"git add <file>...\" to include in what will be committed)",
          "        jarvis-ui/src/app/antigravity/page.tsx",
          "        jarvis-ui/src/components/AntigravityClone.tsx",
          "",
          "no changes added to commit (use \"git add\" and/or \"git commit -a\")"
        );
        break;
      case "npm run dev":
        updatedLogs.push(
          "> jarvis-ui@0.1.0 dev",
          "> next dev",
          "",
          "   ▲ Next.js 16.2.10",
          "   - Local:        http://localhost:3000",
          "   - Environments: .env",
          "",
          " ✓ Starting...",
          " ✓ Ready in 1.4s"
        );
        break;
      case "clear":
        setTerminalLogs([]);
        setTerminalInput("");
        return;
      case "whoami":
        updatedLogs.push(
          "Identity: Antigravity Coding Assistant",
          "Creator: Google DeepMind Team (Advanced Agentic Coding)",
          "Client Platform: Antigravity 2.0 Web UI Mockup"
        );
        break;
      case "model":
        updatedLogs.push(
          `Active Model: ${selectedModel}`,
          "Configuration: High-fidelity reasoning stream, context length 2M tokens."
        );
        break;
      default:
        updatedLogs.push(`'${cmd}' is not recognized as an internal or external command. Type 'help' for support.`);
    }

    setTerminalLogs(updatedLogs);
    setTerminalInput("");
  };

  // Mock Spawn Subagent handler
  const handleSpawnSubagent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubagentName.trim() || !newSubagentPrompt.trim()) return;

    const saId = `sa-${subagents.length + 1}`;
    const name = newSubagentName.toLowerCase();
    
    const newSa: Subagent = {
      id: saId,
      name,
      role: newSubagentRole,
      prompt: newSubagentPrompt,
      status: "running",
      logs: [
        `Initializing subagent: ${name} (${newSubagentRole})...`,
        `Prompt parsed: "${newSubagentPrompt}"`,
        "Spawning child task sandbox...",
        "Executing analysis steps..."
      ]
    };

    setSubagents((prev) => [...prev, newSa]);
    setNewSubagentName("");
    setNewSubagentPrompt("");
    
    setTerminalLogs((prev) => [...prev, `[system] Spawned subagent '${name}' with role '${newSubagentRole}'`, ""]);

    // Complete the subagent task automatically in 3 seconds
    setTimeout(() => {
      setSubagents((prev) =>
        prev.map((sa) =>
          sa.id === saId
            ? {
                ...sa,
                status: "done",
                logs: [
                  ...sa.logs,
                  "Performing repository queries...",
                  "Analysis completed successfully.",
                  "Transmitting results back to parent agent Antigravity.",
                  `Subagent '${name}' terminated completed.`
                ]
              }
            : sa
        )
      );
      setTerminalLogs((prev) => [...prev, `[system] Subagent '${name}' completed execution successfully.`, ""]);
    }, 4000);
  };

  // Render Folder Tree Nodes recursively
  const renderFileSystemNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === "folder";
    const isExpanded = expandedFolders[node.path];

    return (
      <div key={node.path} className="flex flex-col select-none">
        {/* Row element */}
        <div
          onClick={() => handleExplorerClick(node)}
          style={{ paddingLeft: `${depth * 10 + 8}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 hover:bg-zinc-800/60 rounded-md cursor-pointer transition-colors text-xs group ${
            editorFile === node.path && !isFolder ? "bg-indigo-500/10 text-indigo-300 font-medium" : "text-zinc-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isFolder ? (
              // Folder icon + Chevron
              <span className="flex items-center shrink-0">
                <svg
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                </svg>
                <svg className="w-4 h-4 ml-0.5 text-amber-500/80 fill-amber-500/10 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </span>
            ) : (
              // File icon
              <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {/* Active indicator */}
          {!isFolder && editorFile === node.path && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </div>

        {/* Child files container */}
        {isFolder && isExpanded && node.children && (
          <div className="flex flex-col mt-0.5 border-l border-white/5 ml-[14px]">
            {node.children.map((child) => renderFileSystemNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[2];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <header className="glass-panel border-b border-white/5 py-2.5 px-4 flex justify-between items-center z-20 shrink-0">
        
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="gradient-brand w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-md glow-indigo">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white font-mono uppercase">Antigravity 2.0</span>
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full">
                Developer Clone Reference
              </span>
            </div>
          </div>
        </div>

        {/* Center Workspace locator */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-900 border border-white/5 py-1 px-3 rounded-lg text-xs font-mono max-w-sm truncate text-zinc-400">
          <span className="text-zinc-600">Workspace:</span>
          <span className="truncate">c:\Users\pullu\Desktop\jarvis</span>
          <svg className="w-3 h-3 text-zinc-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Right metrics and commands */}
        <div className="flex items-center gap-3">
          
          {/* Model selector dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-zinc-900 border border-white/10 hover:border-white/20 text-[11px] text-zinc-300 font-mono py-1 px-2.5 pr-8 rounded-lg focus:outline-none appearance-none cursor-pointer"
            >
              <option value="Gemini 3.5 Flash (High)">Gemini 3.5 Flash</option>
              <option value="Gemini 3.5 Pro (High)">Gemini 3.5 Pro</option>
              <option value="Gemini 3.5 Ultra (Internal)">Gemini 3.5 Ultra</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-zinc-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Badges */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sandbox Active
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Network Restrained
            </div>
            <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-semibold">
              Cost: $0.14
            </div>
          </div>

          {/* Close clone button */}
          <a
            href="/"
            className="text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-medium cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Clone
          </a>

        </div>
      </header>

      {/* Main Workspace Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-49px)]">
        
        {/* PANEL 1: Left-hand Sidebar (Conversations, Folders Tree dropdown) */}
        <aside className="lg:col-span-3 border-r border-white/5 bg-zinc-950 flex flex-col overflow-hidden">
          
          {/* Top Panel Actions: New conversation */}
          <div className="p-3.5 border-b border-white/5 shrink-0 flex flex-col gap-2">
            <button
              onClick={handleNewChat}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Conversation
              <span className="text-[9px] text-indigo-200 bg-indigo-700/60 font-mono px-1 rounded ml-1">Ctrl+N</span>
            </button>
          </div>

          {/* Scrollable File explorer and history lists */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-5">
            
            {/* Folder Explorer */}
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                  Workspace Folders
                </span>
                <span className="text-[9px] text-indigo-400 font-mono font-semibold uppercase bg-indigo-500/10 px-1 rounded border border-indigo-500/10">
                  Interactive tree
                </span>
              </div>
              <div className="bg-zinc-900/20 border border-white/[0.03] rounded-xl p-2 flex flex-col gap-0.5">
                {renderFileSystemNode(fileSystem)}
              </div>
              <p className="text-[9px] text-zinc-500 font-mono mt-1.5 px-1 leading-relaxed">
                💡 Click directories to toggle their contents dropdown. Click files to inspect code in the right panel.
              </p>
            </div>

            {/* Conversation History */}
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-2 px-1">
                Conversation History
              </span>
              
              <div className="flex flex-col gap-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setTerminalLogs((prev) => [...prev, `[system] Switched active conversation to: "${conv.title}"`, ""]);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition-all ${
                        isActive
                          ? "bg-indigo-600/10 border-indigo-500/20 text-white font-medium"
                          : "bg-zinc-900/30 border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate pr-1">{conv.title}</span>
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                          {conv.messages.length} msg
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-500 truncate leading-none">
                        {conv.messages[conv.messages.length - 1]?.text.slice(0, 45) || "Empty conversation"}...
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Fixed bottom footer */}
          <div className="p-3 bg-zinc-900/20 border-t border-white/5 text-[9px] text-zinc-500 font-mono flex items-center justify-between shrink-0">
            <span>Antigravity v2.0.4-ref</span>
            <span>OS: Windows</span>
          </div>

        </aside>

        {/* PANEL 2: Center Chat Canvas */}
        <section className="lg:col-span-5 flex flex-col justify-between bg-zinc-900/20 overflow-hidden relative border-r border-white/5">
          
          {/* Active conversation title header */}
          <div className="bg-zinc-950/80 border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono">{activeConv.title}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isAgentRunning && (
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono animate-pulse">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-ping" />
                  <span>{runningStep}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
            {activeConv.messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 ${isUser ? "self-end items-end" : "self-start items-start"} max-w-[85%]`}
                >
                  {/* Sender title */}
                  <div className="text-[9px] text-zinc-500 font-mono px-1">
                    {isUser ? "USER" : "ANTIGRAVITY CO-PILOT"} · {msg.timestamp}
                  </div>

                  {/* Message bubble */}
                  <div className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-sm"
                  }`}>
                    {/* Collapsible thought process (Antigravity unique feature) */}
                    {!isUser && msg.thought && (
                      <details open className="mb-2 bg-black/30 rounded-lg border border-white/5">
                        <summary className="cursor-pointer text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-400 p-2 flex items-center gap-1.5 select-none outline-none">
                          <svg className="w-3 h-3 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Thinking Process
                        </summary>
                        <div className="p-2 border-t border-white/5 font-mono text-[9.5px] text-zinc-400 leading-normal whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {msg.thought}
                        </div>
                      </details>
                    )}

                    {/* Run command log rendering */}
                    {!isUser && msg.commands && msg.commands.length > 0 && (
                      <div className="mb-2 bg-black/40 rounded-lg p-2 font-mono text-[9px] border border-white/5 flex flex-col gap-1">
                        <span className="text-zinc-500 uppercase tracking-widest text-[8px] font-bold">Executed Terminal Tool</span>
                        {msg.commands.map((cmd, cidx) => (
                          <div key={cidx} className="flex justify-between items-center gap-3">
                            <span className="text-emerald-400 truncate font-semibold">&gt; {cmd.cmd}</span>
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider shrink-0 font-bold">
                              {cmd.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Markdown rendering simulation */}
                    <div className="space-y-2 whitespace-pre-wrap text-zinc-100 font-sans">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated Live thinking loader */}
            {isAgentRunning && runningStep !== "" && (
              <div className="self-start flex flex-col gap-1.5 max-w-[80%]">
                <div className="text-[9px] text-zinc-500 font-mono">ANTIGRAVITY processing workspace...</div>
                <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl rounded-tl-sm text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[10px] capitalize text-indigo-300 font-bold">
                      {runningStep === "thinking"
                        ? "analyzing files..."
                        : runningStep === "executing"
                        ? "running sandbox command..."
                        : "writing response..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Prompt Input Area */}
          <div className="p-3 border-t border-white/5 bg-zinc-950/80 flex flex-col gap-3 shrink-0">
            
            {/* Quick Slash Commands chips bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[9px] font-bold text-zinc-500 font-mono self-center shrink-0 uppercase mr-1">
                Slash commands:
              </span>
              {[
                { name: "/goal", tip: "Run complex goal overnight" },
                { name: "/schedule", tip: "Set delayed or recurring timer" },
                { name: "/browser", tip: "Trigger web agent search" },
                { name: "/grill-me", tip: "Interactive planning interview" },
                { name: "/learn", tip: "Save instruction to preferences" },
              ].map((cmd) => (
                <button
                  key={cmd.name}
                  onClick={() => setNewChatInput(cmd.name + " ")}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white px-2 py-1 rounded text-[10px] font-semibold font-mono shrink-0 transition-colors cursor-pointer"
                  title={cmd.tip}
                >
                  {cmd.name}
                </button>
              ))}
            </div>

            {/* Input prompt form */}
            <form onSubmit={handleSendPrompt} className="flex gap-2.5 items-center">
              
              {/* Attachment selector */}
              <button
                type="button"
                className="bg-zinc-900 border border-white/10 hover:border-white/20 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 p-2.5 rounded-lg shrink-0 flex items-center justify-center cursor-pointer transition-colors"
                title="Attach context file/folder (@)"
                onClick={() => setNewChatInput((prev) => prev + "@")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Text input */}
              <input
                type="text"
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                placeholder="Ask Antigravity to edit code, execute terminal commands..."
                disabled={isAgentRunning}
                className="flex-1 bg-zinc-900 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-lg px-3 py-2 text-xs focus:outline-none text-white placeholder-zinc-500 transition-all font-sans"
              />

              {/* Submit prompt button */}
              <button
                type="submit"
                disabled={!newChatInput.trim() || isAgentRunning}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-lg shadow-md transition-all shrink-0 flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>

            </form>
            
            {/* Mentions note */}
            <div className="text-[9px] text-zinc-600 font-mono leading-none flex justify-between px-1">
              <span>Type @ to attach files, terminal logs, or past conversations</span>
              <span>Type / for slash commands</span>
            </div>

          </div>

        </section>

        {/* PANEL 3: Right-hand HTML Auxiliary Pane (Tasks, Artifacts, Subagents, Terminals, Editor) */}
        <section className="lg:col-span-4 flex flex-col bg-zinc-950 overflow-hidden">
          
          {/* HTML Pane Tabs */}
          <div className="bg-zinc-900 border-b border-white/5 flex text-xs shrink-0 font-mono">
            {[
              { id: "tasks", label: "Tasks", badge: tasks.filter(t => !t.done).length },
              { id: "artifacts", label: "Artifacts", badge: 3 },
              { id: "subagents", label: "Subagents", badge: subagents.filter(sa => sa.status === "running").length || null },
              { id: "terminals", label: "Terminals", badge: null },
              { id: "editor", label: "Editor", badge: null },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-1 text-center font-bold border-b-2 hover:bg-zinc-800/40 transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? "border-indigo-500 text-white bg-zinc-900/60"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span className={`text-[8.5px] px-1 rounded-full font-mono font-bold shrink-0 ${
                      isActive ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab contents window */}
          <div className="flex-1 overflow-y-auto p-4">
            
            {/* TAB: Checklist Tasks */}
            {activeTab === "tasks" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Project Checklist</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-sans">
                    Track the progress of your active development plan. Toggle tasks to update their completion status.
                  </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-start gap-2.5 p-1 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {task.done ? (
                          // Checked icon
                          <div className="w-3.5 h-3.5 rounded bg-indigo-600 text-white flex items-center justify-center">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          // Unchecked icon
                          <div className="w-3.5 h-3.5 rounded border border-zinc-700 hover:border-zinc-500 transition-colors" />
                        )}
                      </div>
                      <span className={`text-xs select-none transition-all leading-normal ${
                        task.done ? "text-zinc-500 line-through" : "text-zinc-200 font-medium"
                      }`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-3">
                  <h4 className="text-[11px] font-bold text-indigo-300 font-mono uppercase tracking-wider">checklists (task.md)</h4>
                  <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                    Checklists are backed by [task.md](file:///C:/Users/pullu/.gemini/antigravity/brain/9b165ae7-776a-49a2-86fc-00949739bf3e/task.md) in the agent&apos;s artifact directory and update dynamically during code generation runs.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: Artifacts Viewer */}
            {activeTab === "artifacts" && (
              <div className="flex flex-col gap-4 animate-fadeIn h-full">
                
                {/* Selector Header */}
                <div className="flex gap-1.5 border-b border-white/5 pb-3">
                  {[
                    { id: "plan", label: "implementation_plan.md" },
                    { id: "walkthrough", label: "walkthrough.md" },
                    { id: "task", label: "task.md" },
                  ].map((art) => (
                    <button
                      key={art.id}
                      onClick={() => setActiveArtifactId(art.id as any)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all truncate flex-1 border ${
                        activeArtifactId === art.id
                          ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-300"
                          : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {art.label}
                    </button>
                  ))}
                </div>

                {/* Rendered Artifact File */}
                <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-xl p-3.5 overflow-y-auto text-xs font-mono max-h-[380px]">
                  {activeArtifactId === "plan" && (
                    <div className="space-y-4">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-[8.5px] text-zinc-500">PATH: /C:/Users/pullu/.gemini/antigravity/brain/.../implementation_plan.md</span>
                        <h2 className="text-sm font-bold text-white mt-1"># Plan: Antigravity UI Clone</h2>
                      </div>
                      
                      <div className="bg-emerald-950/20 border border-emerald-500/25 p-2.5 rounded-lg text-[10px] text-emerald-300 font-sans leading-normal">
                        <span className="font-bold block uppercase font-mono text-[9px] mb-0.5">🚀 Plan Status: Approved</span>
                        The user has approved this blueprint. All components are active and ready for visual analysis.
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">## Proposed Files</h3>
                        <div className="space-y-1">
                          <p className="text-emerald-400">[NEW] AntigravityClone.tsx</p>
                          <p className="text-emerald-400">[NEW] app/antigravity/page.tsx</p>
                          <p className="text-indigo-400">[MOD] components/LandingPage.tsx</p>
                        </div>
                      </div>

                      <div className="space-y-2 font-sans text-zinc-300 text-[11px] leading-relaxed">
                        <h3 className="text-xs font-bold text-white font-mono border-b border-white/5 pb-1">## Strategy Verification</h3>
                        <p>1. Start local server via npm run dev.</p>
                        <p>2. Verify folder dropdown and conversation switching toggles.</p>
                        <p>3. Submit chat query to test loader and response typing animation.</p>
                      </div>

                      <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs mt-3 flex items-center justify-center gap-1.5 select-none cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Proceed (Approved)
                      </button>
                    </div>
                  )}

                  {activeArtifactId === "walkthrough" && (
                    <div className="space-y-4">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-[8.5px] text-zinc-500">PATH: /C:/Users/pullu/.gemini/antigravity/brain/.../walkthrough.md</span>
                        <h2 className="text-sm font-bold text-white mt-1"># Walkthrough Summary</h2>
                      </div>
                      
                      <div className="bg-indigo-950/20 border border-indigo-500/25 p-2.5 rounded-lg text-[10px] text-indigo-300 font-sans leading-normal">
                        <span className="font-bold block uppercase font-mono text-[9px] mb-0.5">ℹ️ Completed verification details</span>
                        This document is compiled upon final validation of the file additions.
                      </div>

                      <div className="space-y-2 font-sans text-zinc-300 text-[11px] leading-relaxed">
                        <h3 className="text-xs font-bold text-white font-mono border-b border-white/5 pb-1">## Changes Integrated</h3>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Mounted page at route <code className="font-mono text-zinc-200">/antigravity</code>.</li>
                          <li>Integrated layout styled in Tailwind CSS v4.</li>
                          <li>Built interactive files tree and code viewer links.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeArtifactId === "task" && (
                    <div className="space-y-4">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-[8.5px] text-zinc-500">PATH: /C:/Users/pullu/.gemini/antigravity/brain/.../task.md</span>
                        <h2 className="text-sm font-bold text-white mt-1"># Active checklist task.md</h2>
                      </div>
                      
                      <div className="space-y-2 text-[10.5px] font-mono text-zinc-300">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex gap-2">
                            <span>{task.done ? "[x]" : "[ ]"}</span>
                            <span>{task.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB: Subagents Control */}
            {activeTab === "subagents" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Subagents Manager</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-sans">
                    Delegate complex jobs to child processes. They run in sandboxed contexts and return reports.
                  </p>
                </div>

                {/* active subagents list */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Active Subagents ({subagents.length})</span>
                  
                  {subagents.map((sa) => (
                    <details
                      key={sa.id}
                      className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden font-mono text-[10.5px]"
                    >
                      <summary className="cursor-pointer p-3 hover:bg-zinc-800/40 flex justify-between items-center select-none outline-none">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span className="font-bold text-white">{sa.name}</span>
                          <span className="text-[9px] text-zinc-500">({sa.role})</span>
                        </div>
                        <span className={`text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          sa.status === "running"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        }`}>
                          {sa.status}
                        </span>
                      </summary>
                      <div className="p-3 border-t border-white/5 bg-black/35 font-mono text-[9px] text-zinc-400 leading-normal space-y-1.5 max-h-32 overflow-y-auto">
                        {sa.logs.map((log, idx) => (
                          <div key={idx} className={log.startsWith("Error") ? "text-rose-400" : ""}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>

                {/* Spawn new subagent form */}
                <form onSubmit={handleSpawnSubagent} className="border border-white/5 bg-zinc-900/30 rounded-xl p-3.5 flex flex-col gap-3">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Spawn New Subagent</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-zinc-500 uppercase font-mono">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. debugger-2"
                      value={newSubagentName}
                      onChange={(e) => setNewSubagentName(e.target.value)}
                      className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-zinc-500 uppercase font-mono">Role</label>
                    <select
                      value={newSubagentRole}
                      onChange={(e) => setNewSubagentRole(e.target.value)}
                      className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Codebase Researcher">Codebase Researcher</option>
                      <option value="Database Debugger">Database Debugger</option>
                      <option value="Visual Inspector">Visual Inspector</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-zinc-500 uppercase font-mono">Task Prompt</label>
                    <textarea
                      placeholder="Specify what this agent should accomplish..."
                      rows={3}
                      value={newSubagentPrompt}
                      onChange={(e) => setNewSubagentPrompt(e.target.value)}
                      className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    Launch Subagent
                  </button>
                </form>

              </div>
            )}

            {/* TAB: Interactive Terminal */}
            {activeTab === "terminals" && (
              <div className="flex flex-col gap-3 animate-fadeIn h-full">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Terminal Shell</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-sans">
                    Execute scripts and test compiler commands directly inside the active docker container.
                  </p>
                </div>

                {/* Console Log window */}
                <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-[10.5px] text-zinc-300 min-h-[220px] max-h-[300px] overflow-y-auto flex flex-col gap-0.5 shadow-inner">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-normal">
                      {log}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Command Line Input form */}
                <form onSubmit={handleTerminalSubmit} className="flex gap-2 items-center">
                  <span className="text-zinc-500 text-xs font-mono shrink-0">&gt;</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type 'help' for terminal commands..."
                    className="flex-1 bg-zinc-900 border border-white/10 focus:border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 text-xs font-semibold cursor-pointer"
                  >
                    Run
                  </button>
                </form>
              </div>
            )}

            {/* TAB: Editor / Git Diff Viewer */}
            {activeTab === "editor" && (
              <div className="flex flex-col gap-3 animate-fadeIn h-full">
                
                {/* File Info */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">Active Workspace File</span>
                    <h3 className="text-xs font-bold text-indigo-400 font-mono truncate">{editorFile}</h3>
                  </div>
                  <span className="bg-zinc-800 text-zinc-400 font-mono text-[9px] px-2 py-0.5 rounded border border-white/5 shrink-0">
                    Read-Only
                  </span>
                </div>

                {/* Editor window view */}
                <div className="bg-zinc-950 border border-white/10 rounded-xl p-3 font-mono text-[10.5px] text-zinc-300 min-h-[300px] max-h-[380px] overflow-y-auto shadow-inner leading-relaxed whitespace-pre">
                  {editorContent}
                </div>

                {/* Simulating Git Diff component */}
                <div className="border border-white/5 bg-zinc-900/20 rounded-xl p-3.5 flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Git Diff (Staged Changes)</span>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 font-mono text-[9px] text-zinc-400 leading-normal flex flex-col gap-0.5">
                    <div className="text-zinc-500">diff --git a/jarvis-ui/src/app/antigravity/page.tsx b/jarvis-ui/src/app/antigravity/page.tsx</div>
                    <div className="text-zinc-500">new file mode 100644</div>
                    <div className="text-emerald-400">+ import React from &quot;react&quot;;</div>
                    <div className="text-emerald-400">+ import AntigravityClone from &quot;@/components/AntigravityClone&quot;;</div>
                    <div className="text-emerald-400">+ </div>
                    <div className="text-emerald-400">+ export default function AntigravityPage() &#123;</div>
                    <div className="text-emerald-400">+   return &lt;AntigravityClone /&gt;;</div>
                    <div className="text-emerald-400">+ &#125;</div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </section>

      </div>

      {/* Global CSS for Animations and Skeleton layouts (Next.js tailwind safe) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

    </div>
  );
}
