import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import FlightCardChat from "./FlightCardChat";
import { calculateDiscount } from "../utils/discountCalculator";

interface EnhancedAiChatProps {
  onClose?: () => void;
  sessionId?: string;
  initialMessage?: string;
}

export default function EnhancedAiChat({ onClose, sessionId, initialMessage }: EnhancedAiChatProps) {
  const [messages, setMessages] = useState<{ 
    role: string; 
    text: string; 
    timestamp: Date;
    flights?: any[];
    type?: 'text' | 'flights';
  }[]>([]);
  const [text, setText] = useState(initialMessage || "");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      sendInitialMessage();
    }
  }, [initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendInitialMessage = async () => {
    if (!initialMessage) return;
    await sendMessage(initialMessage);
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || text.trim();
    if (!messageToSend || loading) return;
    
    const userMsg = { 
      role: "user", 
      text: messageToSend, 
      timestamp: new Date(),
      type: 'text' as const
    };
    setMessages((m) => [...m, userMsg]);
    setText("");
    setLoading(true);

    try {
      const res = await api.post("/chat/message", { 
        message: messageToSend, 
        sessionId: sessionId || "default" 
      });
      const data = res.data;
      
      // Check if flights are returned
      if (data.intent === "search_flights" && data.parameters?.flights && Array.isArray(data.parameters.flights)) {
        const flights = data.parameters.flights;
        setMessages((m) => [...m, { 
          role: "assistant", 
          text: data.reply_text || `Found ${flights.length} flight${flights.length !== 1 ? 's' : ''} for you! 🎉`,
          timestamp: new Date(),
          flights: flights,
          type: 'flights'
        }]);
      } else {
        setMessages((m) => [...m, { 
          role: "assistant", 
          text: data.reply_text || JSON.stringify(data),
          timestamp: new Date(),
          type: 'text'
        }]);
      }
      
      // Navigate if needed (for non-floating chat)
      if (data.intent === "search_flights" && data.parameters && !onClose) {
        const p = data.parameters;
        if (p.origin && p.destination) {
          nav(`/search?origin=${p.origin}&destination=${p.destination}&date=${p.date || ""}`);
        }
      }
    } catch (e) {
      setMessages((m) => [...m, { 
        role: "assistant", 
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        type: 'text'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = () => {
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSearch = (query: string) => {
    setText(query);
    setTimeout(() => sendMessage(query), 100);
  };

  const handleBookFlight = async (flightId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (onClose) onClose();
      nav("/login");
      return;
    }

    try {
      await api.post("/bookings", { flightId });
      setMessages((m) => [...m, {
        role: "assistant",
        text: "🎉 Booking successful! Your flight has been confirmed.",
        timestamp: new Date(),
        type: 'text'
      }]);
    } catch (err: any) {
      setMessages((m) => [...m, {
        role: "assistant",
        text: err?.response?.data?.error || "Booking failed. Please try again.",
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-booking-lightblue to-booking-blue p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Travel Assistant</h3>
            <p className="text-xs text-white/80">Ask me to find flights with exclusive deals!</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="text-5xl mb-4">✈️🤖</div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Hi! I'm your AI travel assistant
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              I can help you find flights with exclusive discounts and offers!
            </p>
            
            {/* Quick Actions */}
            <div className="space-y-2 max-w-xs mx-auto">
              <button
                onClick={() => handleQuickSearch("Find flights from Delhi to Mumbai")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-booking-lightblue text-booking-lightblue rounded-lg hover:bg-booking-lightblue hover:text-white transition-all duration-200 text-sm font-semibold"
              >
                🔍 Search Flights
              </button>
              <button
                onClick={() => handleQuickSearch("Show me cheap flights to Bangalore")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-booking-lightblue text-booking-lightblue rounded-lg hover:bg-booking-lightblue hover:text-white transition-all duration-200 text-sm font-semibold"
              >
                💰 Find Deals
              </button>
              <button
                onClick={() => handleQuickSearch("What are the best flight options for next week?")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-booking-lightblue text-booking-lightblue rounded-lg hover:bg-booking-lightblue hover:text-white transition-all duration-200 text-sm font-semibold"
              >
                📅 Best Options
              </button>
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            {m.type === 'flights' && m.flights ? (
              <div className="w-full max-w-full">
                <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-2 mb-3 shadow-sm max-w-[80%]">
                  <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                </div>
                <div className="space-y-2">
                  {m.flights.map((flight, idx) => {
                    const discountInfo = calculateDiscount(flight);
                    return (
                      <FlightCardChat
                        key={flight.id || idx}
                        flight={flight}
                        discount={discountInfo.discount}
                        offerText={discountInfo.offerText}
                        origin={flight.origin}
                        destination={flight.destination}
                        onBook={() => handleBookFlight(flight.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
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
            )}
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
            className="flex-1 input-field text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about flights, e.g., 'Find flights from Delhi to Mumbai'"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || loading}
            className="px-6 py-3 bg-booking-lightblue hover:bg-booking-blue text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

