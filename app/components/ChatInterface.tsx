"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import logger from "@/lib/logger";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autonomousTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Autonomous mode timer
  useEffect(() => {
    if (autonomousMode && messages.length > 0) {
      // Check for inactivity every 30 seconds
      autonomousTimerRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;

        // If inactive for 45 seconds and we have at least 2 messages, trigger autonomous message
        if (timeSinceLastActivity > 45000 && messages.length >= 2) {
          generateAutonomousMessage();
        }
      }, 30000); // Check every 30 seconds
    } else {
      if (autonomousTimerRef.current) {
        clearInterval(autonomousTimerRef.current);
        autonomousTimerRef.current = null;
      }
    }

    return () => {
      if (autonomousTimerRef.current) {
        clearInterval(autonomousTimerRef.current);
      }
    };
  }, [autonomousMode, messages.length, lastActivity]);

  const generateAutonomousMessage = async () => {
    if (isLoading) return; // Don't interrupt if already processing

    logger.userAction("autonomous_message_triggered");

    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Need authentication for autonomous mode

      // Prepare conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send autonomous request
      const response = await apiClient.post("/api/v1/chat/chat", {
        message: "", // Empty message triggers autonomous generation
        conversation_history: conversationHistory,
        autonomous_mode: true,
      });

      // Add autonomous message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);

      logger.info("Autonomous message generated", { messageLength: response.message.length });

      // Reset activity timer
      setLastActivity(Date.now());

    } catch (error: any) {
      logger.error("Autonomous message error", error);
    }
  };

  const toggleAutonomousMode = () => {
    const newMode = !autonomousMode;
    setAutonomousMode(newMode);
    logger.userAction("autonomous_mode_toggled", { enabled: newMode });

    if (newMode) {
      setLastActivity(Date.now());
    }
  };

  // Get initial greeting
  useEffect(() => {
    logger.info("ChatInterface initialized");
    
    const getGreeting = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          logger.info("User not logged in, showing default greeting");
          // If not logged in, show a simple greeting
          setMessages([
            {
              role: "assistant",
              content: "Hello! I'm your CMO AI assistant. I'm here to help you with all your marketing needs - from content strategy and social media campaigns to brand positioning and audience engagement.\n\nTo get the most personalized help, please log in or register. But feel free to ask me anything about marketing!",
            },
          ]);
          setIsInitializing(false);
          return;
        }

        logger.debug("Fetching personalized greeting from API");
        const response = await apiClient.get("/api/v1/chat/greeting");
        setMessages([
          {
            role: "assistant",
            content: response.message,
          },
        ]);
        logger.info("Greeting loaded successfully");
      } catch (error) {
        logger.error("Failed to load greeting", error);
        // Fallback greeting
        setMessages([
          {
            role: "assistant",
            content: "Hello! I'm your CMO AI assistant. I'm here to help you with all your marketing needs - from content strategy and social media campaigns to brand positioning and audience engagement. How can I assist you today?",
          },
        ]);
      } finally {
        setIsInitializing(false);
      }
    };

    getGreeting();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    logger.userAction("chat_message_sent", { messageLength: userMessage.length });

    setInput("");
    setIsLoading(true);
    setLastActivity(Date.now()); // Reset activity timer

    // Add user message
    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Allow basic chat even without login, but suggest login for better experience
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'd love to help you with marketing! For personalized assistance and to save your conversation history, please log in or register. In the meantime, I can still answer general marketing questions. What would you like to know?",
          },
        ]);
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }

      // Prepare conversation history
      const conversationHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to API
      logger.debug("Sending chat message to API", { messageLength: userMessage.length, historyLength: conversationHistory.length });
      const response = await apiClient.post("/api/v1/chat/chat", {
        message: userMessage,
        conversation_history: conversationHistory,
        autonomous_mode: autonomousMode,
      });

      // Add assistant response
      logger.info("Chat response received", { responseLength: response.message.length });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);

      // Handle autonomous follow-up if available
      if (response.autonomous_followup && autonomousMode) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response.autonomous_followup },
          ]);
          logger.info("Autonomous follow-up added", { followupLength: response.autonomous_followup.length });
        }, 2000); // 2 second delay for natural conversation flow
      }

    } catch (error: any) {
      logger.error("Chat error", error, { userMessage });
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "I apologize, but I'm having trouble right now. Could you try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Update activity on user interactions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setLastActivity(Date.now());
  };

  const handleInputFocus = () => {
    setLastActivity(Date.now());
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CMO AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CMO AI</h1>
            {autonomousMode && (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Autonomous</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {localStorage.getItem("token") && (
              <button
                onClick={toggleAutonomousMode}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  autonomousMode
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>{autonomousMode ? 'Autonomous ON' : 'Autonomous OFF'}</span>
              </button>
            )}
            {!localStorage.getItem("token") && (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Login
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/register" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  Register
                </Link>
              </div>
            )}
            <div className="text-sm text-gray-500">Your Marketing Assistant</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-900 shadow-sm border border-gray-200"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={autonomousMode ? "Chat with me or let me guide the conversation..." : "Ask me anything about marketing..."}
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 overflow-y-auto"
                style={{ minHeight: "48px" }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              CMO AI can help with content strategy, social media, campaigns, and more
            </p>
            {autonomousMode && (
              <p className="text-xs text-green-600 font-medium">
                🤖 Autonomous mode active
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

