"use client";

import React, { useState, useEffect } from "react";

interface LoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAutoFilling) return;

    if (!username.trim() || !password.trim()) {
      triggerError("Please fill in all fields.");
      return;
    }

    if (username === "demo" && password === "demo123") {
      executeLoginFlow();
    } else {
      triggerError("Invalid username or password. Try the demo credentials below.");
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShouldShake(true);
    // Vibrate device if API supported (nice detail)
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  };

  useEffect(() => {
    if (shouldShake) {
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShake]);

  const executeLoginFlow = () => {
    setError("");
    setIsSubmitting(true);
    
    // Simulate loading steps for premium hackathon feel
    const steps = [
      { text: "Verifying credentials...", delay: 400 },
      { text: "Securing local session...", delay: 800 },
      { text: "Syncing ChromaDB vector index...", delay: 1200 },
      { text: "Redirecting to workspace...", delay: 1600 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingStep(step.text);
        if (index === steps.length - 1) {
          setTimeout(() => {
            onLogin();
          }, 300);
        }
      }, step.delay);
    });
  };

  const handleAutoFill = () => {
    if (isSubmitting || isAutoFilling) return;
    
    setIsAutoFilling(true);
    setError("");
    setUsername("");
    setPassword("");

    const targetUser = "demo";
    const targetPass = "demo123";
    
    let userIndex = 0;
    let passIndex = 0;

    // Simulate keyboard typing for username
    const userInterval = setInterval(() => {
      if (userIndex < targetUser.length) {
        setUsername((prev) => prev + targetUser[userIndex]);
        userIndex++;
      } else {
        clearInterval(userInterval);
        
        // Start typing password after a tiny pause
        setTimeout(() => {
          const passInterval = setInterval(() => {
            if (passIndex < targetPass.length) {
              setPassword((prev) => prev + targetPass[passIndex]);
              passIndex++;
            } else {
              clearInterval(passInterval);
              setIsAutoFilling(false);
              
              // Trigger submit after complete auto-fill
              setTimeout(() => {
                executeLoginFlow();
              }, 400);
            }
          }, 80);
        }, 200);
      }
    }, 80);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 radial-glow grid-bg overflow-hidden flex flex-col justify-center items-center px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-xs text-zinc-400 hover:text-white bg-zinc-900/60 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium cursor-pointer z-20"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>
      {/* Decorative Glow Shapes */}
      <div className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Main Container */}
      <div 
        className={`w-full max-w-md relative z-10 transition-all duration-300 ${
          shouldShake ? "animate-[shake_0.5s_ease-in-out]" : ""
        }`}
      >
        {/* Logo / Title Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="gradient-brand w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xl glow-indigo mb-4 animate-float">
            J
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2">
            JARVIS <span className="text-xs font-sans bg-violet-500/15 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full uppercase tracking-wider">RAG Console</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs">
            AI-Powered Business Intelligence Assistant for Compliance & Contracts
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel border-white/5 shadow-2xl rounded-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Top glowing bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          {isSubmitting ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              {/* Spinner */}
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-wide">
                Securing Workspace
              </h3>
              <p className="text-sm text-zinc-400 font-mono mt-2 animate-pulse">
                {loadingStep || "Initializing secure handshake..."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>

              {/* Error Alert Box */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl p-3.5 flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Username field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    disabled={isAutoFilling}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-zinc-900/60 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    disabled={isAutoFilling}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/60 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isAutoFilling}
                className="w-full mt-2 gradient-brand text-white py-3 rounded-xl font-bold hover:opacity-95 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Launch Console
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </form>
          )}
        </div>

        {/* Demo Credentials Section */}
        <div className="mt-6 glass-panel border-white/5 rounded-2xl p-5 bg-zinc-900/30 flex flex-col gap-3 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest font-mono">
                Demo Environment Credentials
              </h4>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              One-Click
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/60 border border-white/5 rounded-xl p-3.5 font-mono">
            <div>
              <span className="text-zinc-500">Username: </span>
              <span className="text-zinc-200 font-semibold">demo</span>
            </div>
            <div>
              <span className="text-zinc-500">Password: </span>
              <span className="text-zinc-200 font-semibold">demo123</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoFill}
            disabled={isSubmitting || isAutoFilling}
            className="w-full bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 text-indigo-300 font-medium py-2.5 rounded-xl text-xs transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAutoFilling ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Auto-typing credentials...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Auto-Fill & Launch
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-zinc-600 text-center font-mono mt-8">
          Vynedam Talent Hunt 2K26 · Malla Reddy University · Hyderabad
        </p>
      </div>

      {/* Global Inline Shake Keyframes definition (Next.js tailwind safe) */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
