import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import FlightCardChat from "./FlightCardChat";
import { calculateDiscount } from "../utils/discountCalculator";
import LoadingSpinner from "./LoadingSpinner";
import { 
  RobotIcon, 
  FlightIcon, 
  SecureIcon, 
  UserIcon, 
  SeatIcon 
} from "./Icons";

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

  // --- MMT Myra Style Booking Wizard State ---
  const [bookingFlight, setBookingFlight] = useState<any | null>(null);
  const [bookingStep, setBookingStep] = useState<'none' | 'seat' | 'passenger' | 'payment'>('none');
  const [bookingSeat, setBookingSeat] = useState<string>("");
  const [bookingName, setBookingName] = useState<string>("");
  const [bookingUpi, setBookingUpi] = useState<string>("");
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
    if (messages.length > 0) {
      scrollToBottom();
    }
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
          text: data.reply_text || `Found ${flights.length} flight${flights.length !== 1 ? 's' : ''} for you.`,
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

  const handleQuickAction = (actionType: "SEARCH" | "DEALS" | "OPTIONS") => {
    let assistantReply = "";
    let userHintText = "";

    if (actionType === "SEARCH") {
      assistantReply = "Where would you like to fly from and to? Please tell me your origin and destination (e.g., 'Delhi to Mumbai').";
      userHintText = "Fly from Delhi to Mumbai tomorrow";
    } else if (actionType === "DEALS") {
      assistantReply = "Let's find some great deals! Which city or route are you interested in? (e.g., 'deals to Bangalore' or 'cheap flights from Delhi').";
      userHintText = "Cheap flights to Bangalore";
    } else if (actionType === "OPTIONS") {
      assistantReply = "I'll find the best options for you. Where are you planning to travel and when? (e.g., 'best flights to Goa next week').";
      userHintText = "Best flights to Goa next week";
    }

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: assistantReply,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    
    setText("");
    if (inputRef.current) {
      inputRef.current.placeholder = `E.g., "${userHintText}"`;
      inputRef.current.focus();
    }
  };

  const startChatBooking = (flight: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (onClose) onClose();
      nav("/login");
      return;
    }
    setBookingFlight(flight);
    setBookingStep('seat');
    setBookingSeat("");
    setBookingName("");
    setBookingUpi("");

    setMessages((m) => [...m, {
      role: "assistant",
      text: `🛫 Initializing booking for flight **${flight.flightNumber}** (${flight.origin} ➔ ${flight.destination}).\n\nTo begin, please select a seat from the seating chart below:`,
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  const handleSelectSeat = (seatId: string) => {
    setBookingSeat(seatId);
    setBookingStep('passenger');
    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: `Selected Seat ${seatId}`,
        timestamp: new Date(),
        type: 'text'
      },
      {
        role: "assistant",
        text: `Seat **${seatId}** selected successfully!\n\n👤 Please enter the traveler's full name to register the ticket:`,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  };

  const handleConfirmPassenger = () => {
    setBookingStep('payment');
    const seatCost = bookingSeat.startsWith('1') ? 5000 : 800;
    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: `Passenger Name: ${bookingName}`,
        timestamp: new Date(),
        type: 'text'
      },
      {
        role: "assistant",
        text: `Traveler registered: **${bookingName}**.\n\n💳 Standard fare: ₹${(bookingFlight.basePriceCents / 100).toLocaleString('en-IN')}\nSeat selection fee: ₹${seatCost.toLocaleString('en-IN')}\n\nTo complete your booking, please enter your UPI ID for secure checkout:`,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  };

  const handleCancelBooking = () => {
    setBookingFlight(null);
    setBookingStep('none');
    setMessages((m) => [...m, {
      role: "assistant",
      text: "Booking session terminated. Let me know if you want to search for other routes!",
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  const handleConfirmPayment = async () => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(bookingUpi.trim())) {
      setMessages((m) => [...m, {
        role: "assistant",
        text: "⚠️ Invalid UPI ID format. Please verify and enter a valid address (e.g., name@bank).",
        timestamp: new Date(),
        type: 'text'
      }]);
      return;
    }

    setLoading(true);
    let createdBookingId = "";
    
    const seatCost = bookingSeat.startsWith('1') ? 500000 : 80000;
    const totalCents = bookingFlight.basePriceCents + seatCost;

    try {
      const resBooking = await api.post("/bookings", {
        flightId: bookingFlight.id,
        seatNumber: bookingSeat,
        passengerNames: bookingName,
        totalPriceCents: totalCents,
        luggageOption: "15kg (Included)",
        mealOption: "None",
        wifiOption: "None",
        insuranceOption: "None"
      });
      createdBookingId = resBooking.data.id;

      await api.post(`/bookings/${createdBookingId}/pay`, {
        method: "UPI",
        upiId: bookingUpi.trim()
      });

      setMessages((m) => [
        ...m,
        {
          role: "user",
          text: `Paid via UPI (${bookingUpi})`,
          timestamp: new Date(),
          type: 'text'
        },
        {
          role: "assistant",
          text: `🎉 **Booking Confirmed successfully!**\n\n🎟️ **Ticket ID**: ${createdBookingId}\n✈️ **Flight**: ${bookingFlight.flightNumber} (${bookingFlight.origin} ➔ ${bookingFlight.destination})\n👤 **Passenger**: ${bookingName}\n💺 **Seat**: ${bookingSeat}\n💰 **Amount Paid**: ₹${(totalCents / 100).toLocaleString('en-IN')}\n\nYour digital boarding pass has been registered in the system. You can view or print it from the "My Bookings" page!`,
          timestamp: new Date(),
          type: 'text'
        }
      ]);
      
      setBookingFlight(null);
      setBookingStep('none');
    } catch (err: any) {
      if (createdBookingId) {
        api.delete(`/bookings/${createdBookingId}`).catch(() => {});
      }
      setMessages((m) => [...m, {
        role: "assistant",
        text: `❌ Transaction failed: ${err?.response?.data?.error || "Unable to confirm booking. Please try again."}`,
        timestamp: new Date(),
        type: 'text'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMiniSeatMap = () => {
    const rows = [1, 2, 3, 4];
    const cols = ["A", "B", "C", "D"];
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="text-xs font-extrabold uppercase text-booking-lightblue text-center font-display flex items-center justify-center gap-1.5">
          <SeatIcon className="w-4 h-4 text-booking-lightblue" />
          <span>Seating Map: {bookingFlight.flightNumber}</span>
        </div>
        <div className="grid gap-2 max-w-[200px] mx-auto">
          {rows.map((row) => (
            <div key={row} className="flex justify-between items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold w-3">{row}</span>
              <div className="flex gap-1.5">
                {cols.map((col) => {
                  const seatId = `${row}${col}`;
                  const isBusiness = row === 1;
                  return (
                    <button
                      key={col}
                      onClick={() => handleSelectSeat(seatId)}
                      className={`w-8 h-8 text-[10px] font-bold border transition-all ${
                        isBusiness
                          ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200"
                          : "bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-booking-lightblue"
                      } hover:border-booking-lightblue`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-center text-gray-400 font-semibold">
          Row 1: Business (+₹5k) | Row 2-4: Economy (+₹800)
        </div>
      </div>
    );
  };

  const renderPassengerForm = () => {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-scale-in">
        <div className="flex justify-between items-center">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase font-display flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-booking-lightblue" />
            <span>Passenger Details</span>
          </div>
          <button onClick={handleCancelBooking} className="text-[10px] text-red-500 hover:underline font-extrabold uppercase">Cancel</button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={bookingName}
            onChange={(e) => setBookingName(e.target.value)}
            placeholder="Traveler's Full Name (e.g. Lokesh Parasuraman)"
            className="flex-1 input-field text-sm"
          />
          <button
            onClick={handleConfirmPassenger}
            disabled={!bookingName.trim()}
            className="btn-primary py-2.5 px-6 text-xs whitespace-nowrap"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    const seatCost = bookingSeat.startsWith('1') ? 500000 : 80000;
    const totalCents = bookingFlight.basePriceCents + seatCost;
    
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-scale-in">
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase font-display">
          <span className="flex items-center gap-1.5">
            <SecureIcon className="w-4 h-4 text-emerald-500" />
            <span>UPI Secure Checkout</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-booking-lightblue">Total: ₹{(totalCents / 100).toLocaleString('en-IN')}</span>
            <button onClick={handleCancelBooking} className="text-[10px] text-red-500 hover:underline font-extrabold">CANCEL</button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={bookingUpi}
            onChange={(e) => setBookingUpi(e.target.value)}
            placeholder="UPI ID (e.g. user@bank)"
            className="flex-1 input-field text-sm"
          />
          <button
            onClick={handleConfirmPayment}
            disabled={loading || !bookingUpi.trim()}
            className="btn-primary py-2.5 px-6 text-xs whitespace-nowrap flex items-center gap-1.5"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Pay & Book"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-booking-lightblue to-booking-blue p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <RobotIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">FlyFast AI Assistant</h3>
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
            <div className="flex justify-center items-center gap-3 mb-4">
              <FlightIcon className="w-12 h-12 text-booking-lightblue transform -rotate-45" />
              <RobotIcon className="w-12 h-12 text-purple-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Hi! I'm your FlyFast AI assistant
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              I can help you find flights with exclusive discounts and offers!
            </p>

            {/* Quick Actions */}
            <div className="space-y-2 max-w-xs mx-auto">
              <button
                onClick={() => handleQuickAction("SEARCH")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-booking-lightblue text-booking-lightblue rounded-lg hover:bg-booking-lightblue hover:text-white transition-all duration-200 text-sm font-semibold"
              >
                🔍 Search Flights
              </button>
              <button
                onClick={() => handleQuickAction("DEALS")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-booking-lightblue text-booking-lightblue rounded-lg hover:bg-booking-lightblue hover:text-white transition-all duration-200 text-sm font-semibold"
              >
                💰 Find Deals
              </button>
              <button
                onClick={() => handleQuickAction("OPTIONS")}
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
                        onBook={() => startChatBooking(flight)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === "user"
                    ? "bg-booking-lightblue text-white"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
                  }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                <div
                  className={`text-xs mt-1 ${m.role === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
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

      {/* MMT Myra Style Booking Wizard Step Panels */}
      {bookingStep === 'passenger' && renderPassengerForm()}
      {bookingStep === 'payment' && renderPaymentForm()}
      
      {/* Seat Selection Panel */}
      {bookingStep === 'seat' && bookingFlight && (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {renderMiniSeatMap()}
          <div className="text-center">
            <button onClick={handleCancelBooking} className="text-xs text-red-500 hover:underline font-bold uppercase tracking-wider">
              Cancel booking wizard
            </button>
          </div>
        </div>
      )}

      {/* Default Chat Input (Hidden when Booking Wizard is active) */}
      {bookingStep === 'none' && (
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
      )}
    </div>
  );
}

