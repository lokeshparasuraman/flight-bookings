import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AiChat({ sessionId }: { sessionId?: string }) {
  const [messages, setMessages] = useState<{ role: string; text: string; timestamp: Date }[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function send() {
    if (!text.trim() || loading) return;
    
    const userMsg = { role: "user", text: text.trim(), timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setText("");
    setLoading(true);

    try {
      const res = await api.post("/chat/message", { 
        message: userMsg.text, 
        sessionId: sessionId || "default" 
      });
      const data = res.data;
      setMessages((m) => [...m, { 
        role: "assistant", 
        text: data.reply_text || JSON.stringify(data),
        timestamp: new Date()
      }]);
      
      if (data.intent === "search_flights" && data.parameters?.flights) {
        const p = data.parameters;
        nav(`/search?origin=${p.origin}&destination=${p.destination}&date=${p.date || ""}`);
      }
    } catch (e) {
      setMessages((m) => [...m, { 
        role: "assistant", 
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="card p-0 overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-booking-lightblue to-booking-blue p-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Travel Assistant</h3>
            <p className="text-sm text-white/80">Ask me anything about flights</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-4xl mb-2">👋</div>
            <p>Hi! How can I help you find the perfect flight?</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                m.role === "user"
                  ? "bg-booking-lightblue text-white"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
              <div
                className={`text-xs mt-1 ${
                  m.role === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-2 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="flex-1 input-field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about flights, prices, or destinations..."
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!text.trim() || loading}
            className="px-6 py-3 bg-booking-lightblue hover:bg-booking-blue text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • Try: "Find flights from Delhi to Mumbai"
        </p>
      </div>
    </div>
  );
}
