import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  X,
  Loader,
  MessageCircle,
  Minimize2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { ChatMessage, Device, EnergyDataPoint } from "../types";
import { generateStreamingChatResponse } from "../chatService";

interface ChatbotProps {
  devices: Device[];
  energyData: EnergyDataPoint[];
  onClose: () => void;
}

interface SuggestedQuestion {
  question: string;
  icon: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ devices, energyData, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "# Welcome to Your AI Energy Advisor! 🌟\n\nI'm here to help you optimize your energy usage and save money. I can answer questions about:\n\n**Energy Usage**\n- Current consumption patterns\n- Peak usage times\n- Cost analysis\n\n**Devices**\n- Individual device performance\n- Energy-hungry appliances\n- Smart recommendations\n\n**Savings**\n- Cost reduction strategies\n- Efficiency improvements\n- Personalized tips\n\n💡 **Pro Tip:** If you see a Puter login popup, create a FREE account (no email needed!) for unlimited AI access in just 10 seconds!\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewResponse, setHasNewResponse] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<
    SuggestedQuestion[]
  >([
    { question: "Which device uses the most energy?", icon: "⚡" },
    { question: "How can I reduce my energy costs?", icon: "💰" },
    { question: "What's my peak usage time?", icon: "📊" },
    { question: "Should I turn off my HVAC at night?", icon: "🌡️" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate contextual follow-up questions based on last response
  const generateFollowUpQuestions = (
    lastResponse: string
  ): SuggestedQuestion[] => {
    // Smart question generation based on context
    const contextualQuestions: SuggestedQuestion[] = [
      { question: "Tell me more about this", icon: "🔍" },
      { question: "What else should I consider?", icon: "💭" },
      { question: "How can I implement this?", icon: "🛠️" },
    ];

    // Add context-specific questions
    if (
      lastResponse.toLowerCase().includes("hvac") ||
      lastResponse.toLowerCase().includes("heating")
    ) {
      contextualQuestions.unshift({
        question: "What's the ideal temperature setting?",
        icon: "🌡️",
      });
    }
    if (
      lastResponse.toLowerCase().includes("cost") ||
      lastResponse.toLowerCase().includes("save")
    ) {
      contextualQuestions.unshift({
        question: "How much money could I save?",
        icon: "💰",
      });
    }
    if (
      lastResponse.toLowerCase().includes("peak") ||
      lastResponse.toLowerCase().includes("usage")
    ) {
      contextualQuestions.unshift({
        question: "When should I run my appliances?",
        icon: "⏰",
      });
    }

    return contextualQuestions.slice(0, 3);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setHasNewResponse(false);

    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Stream the response
      let fullResponse = "";
      for await (const chunk of generateStreamingChatResponse(
        userMessage.content,
        devices,
        energyData,
        messages
      )) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      }

      // Generate follow-up questions after response is complete
      const followUps = generateFollowUpQuestions(fullResponse);
      setSuggestedQuestions(followUps);

      // Notify user if chatbot is minimized
      if (isMinimized) {
        setHasNewResponse(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "⚠️ I encountered an error. Please try again or rephrase your question.",
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setHasNewResponse(false);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setHasNewResponse(false);
    inputRef.current?.focus();
  };

  // Format message content with markdown-like syntax
  const formatMessage = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith("# ")) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h1
            key={index}
            className="text-lg font-bold mb-3 text-primary-600 dark:text-primary-400"
          >
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h2
            key={index}
            className="text-base font-bold mb-2 text-gray-800 dark:text-gray-200"
          >
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h3
            key={index}
            className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300"
          >
            {line.substring(4)}
          </h3>
        );
      }
      // Bold text
      else if (line.startsWith("**") && line.endsWith("**")) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <p key={index} className="font-bold mb-2 text-sm">
            {line.substring(2, line.length - 2)}
          </p>
        );
      }
      // List items
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        currentList.push(line.substring(2));
      }
      // Code blocks
      else if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
      }
      // Regular paragraphs
      else if (line.trim()) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }

        // Process inline formatting
        const processedLine = line.split(/(\*\*.*?\*\*)/).map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i}>{part.substring(2, part.length - 2)}</strong>
            );
          }
          return part;
        });

        elements.push(
          <p key={index} className="mb-2 text-sm leading-relaxed">
            {processedLine}
          </p>
        );
      }
      // Empty lines
      else if (line === "" && elements.length > 0) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
      }
    });

    // Add remaining list items
    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc pl-5 space-y-1 mb-3">
          {currentList.map((item, i) => (
            <li key={i} className="text-sm">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  // Minimized view
  if (isMinimized) {
    return (
      <button
        onClick={handleRestore}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-br from-primary-500 to-secondary-600 text-white rounded-2xl shadow-2xl hover:shadow-glow-lg transition-all duration-300 z-50 group ${
          hasNewResponse ? "animate-bounce" : ""
        }`}
        title="Open AI Assistant"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {hasNewResponse && (
            <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
          {isTyping && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <Loader className="w-3 h-3 text-primary-500 animate-spin" />
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[480px] md:h-[700px] bg-white dark:bg-gray-900 md:rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 animate-scale-in">
      {/* Premium Header */}
      <div className="relative flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 md:rounded-t-3xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm md:rounded-t-3xl" />
        <div className="relative flex items-center space-x-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-white animate-pulse-slow" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg">AI Energy Advisor</h3>
            <p className="text-xs text-white/90 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Powered by Claude Sonnet 4
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <button
            onClick={handleMinimize}
            className="p-2 hover:bg-white/20 rounded-xl transition-all hover-lift active:scale-95"
            title="Minimize"
          >
            <Minimize2 className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all hover-lift active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
        {messages.map((message, msgIndex) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 animate-slide-up ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
            style={{ animationDelay: `${msgIndex * 50}ms` }}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 p-2.5 rounded-xl shadow-md ${
                message.role === "user"
                  ? "bg-gradient-to-br from-secondary-500 to-secondary-600"
                  : "bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex-1 ${message.role === "user" ? "items-end" : ""}`}
            >
              <div
                className={`p-4 rounded-2xl shadow-soft ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-secondary-500 to-secondary-600 text-white ml-12"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-12 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formatMessage(message.content)}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
              <p
                className={`text-xs mt-2 px-2 ${
                  message.role === "user"
                    ? "text-right text-gray-500 dark:text-gray-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 animate-slide-up">
            <div className="flex-shrink-0 p-2.5 rounded-xl shadow-md bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50">
              <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-soft border border-gray-200 dark:border-gray-700 mr-12">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Analyzing your energy data...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {!isTyping && messages.length > 0 && suggestedQuestions.length > 0 && (
        <div className="px-4 md:px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Suggested questions:
          </p>
          <div className="flex flex-col gap-2">
            {suggestedQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(item.question)}
                className="text-left text-xs px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover-lift group flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="font-medium">{item.question}</span>
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 md:p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:rounded-b-3xl">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef as any}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your energy usage..."
            disabled={isTyping}
            rows={1}
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm transition-all"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-xl hover:from-primary-600 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover-lift active:scale-95 flex-shrink-0"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-2xs text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">
          🚀 Powered by FREE Puter.js AI • Press Enter to send
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
