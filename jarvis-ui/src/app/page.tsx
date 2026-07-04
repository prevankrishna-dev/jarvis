"use client";

import React, { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import ChatDashboard from "@/components/ChatDashboard";
import LoginPage from "@/components/LoginPage";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [screen, setScreen] = useState<"landing" | "login" | "console">("landing");

  // Initialize login state from localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem("jarvis_logged_in") === "true";
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setScreen("console");
    } else {
      setScreen("landing");
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("jarvis_logged_in", "true");
    setIsLoggedIn(true);
    setScreen("console");
  };

  const handleLogout = () => {
    localStorage.removeItem("jarvis_logged_in");
    setIsLoggedIn(false);
    setScreen("landing");
  };

  // Prevent UI flash during hydration / localStorage retrieval
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (screen === "landing") {
    return (
      <LandingPage 
        onGoToLogin={() => setScreen("login")}
        onGoToConsole={() => setScreen("console")}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  if (screen === "login") {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onBack={() => setScreen("landing")} 
      />
    );
  }

  return (
    <ChatDashboard 
      onLogout={handleLogout}
      onGoToLanding={() => setScreen("landing")}
    />
  );
}
