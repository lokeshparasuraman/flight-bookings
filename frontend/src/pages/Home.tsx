import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EnhancedAiChat from "../components/EnhancedAiChat";

export default function Home() {
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("BOM");
  const [date, setDate] = useState("2025-12-20");
  const [travelers, setTravelers] = useState(1);
  const [showAiChat, setShowAiChat] = useState(false);
  const nav = useNavigate();

  function search(e: React.FormEvent) {
    e.preventDefault();
    nav(`/search?origin=${origin}&destination=${destination}&date=${date}`);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container py-12 md:py-20">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-booking-blue via-booking-lightblue to-booking-blue bg-clip-text text-transparent">
              FlyFast with AI
            </h1>
            <p className="text-xl md:text-3xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 font-medium">
              Book flights the smart way - Use AI to find the best deals with exclusive discounts! 🎉
            </p>
            <div className="flex items-center justify-center gap-4 text-sm md:text-base text-gray-500 dark:text-gray-400">
              <span>✨ AI-Powered</span>
              <span>•</span>
              <span>💰 Exclusive Discounts</span>
              <span>•</span>
              <span>⚡ Instant Booking</span>
            </div>
          </div>

          {/* Two Options: Manual Search or AI Chat */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Manual Search */}
            <div className="animate-slide-up">
              <div className="card p-6 md:p-8 shadow-soft-lg h-full">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-xl flex items-center justify-center text-white text-2xl">
                    🔍
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Search flights
                  </h2>
                </div>
                <form onSubmit={search} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        From
                      </label>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="input-field"
                        placeholder="DEL"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        To
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="input-field"
                        placeholder="BOM"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Travelers
                    </label>
                    <input
                      type="number"
                      value={travelers}
                      min={1}
                      max={9}
                      onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                      className="input-field"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary text-lg py-4"
                  >
                    Search Flights
                  </button>
                </form>
              </div>
            </div>

            {/* AI Chat Option */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="card p-6 md:p-8 shadow-soft-lg h-full bg-gradient-to-br from-booking-lightblue/10 to-booking-blue/10 border-2 border-booking-lightblue/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl animate-pulse-slow">
                    🤖
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      AI Assistant
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get exclusive discounts!
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Talk to our AI assistant to find flights with <span className="font-bold text-booking-lightblue">exclusive discounts</span> and personalized recommendations. Just tell us where you want to go!
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Try saying:
                    </div>
                    <button
                      onClick={() => setShowAiChat(true)}
                      className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                      💬 "Find flights from Delhi to Mumbai with discounts"
                    </button>
                    <button
                      onClick={() => setShowAiChat(true)}
                      className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                      💰 "Show me cheap flights to Bangalore"
                    </button>
                    <button
                      onClick={() => setShowAiChat(true)}
                      className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                      🎯 "What are the best flight deals for next week?"
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAiChat(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                  >
                    🤖 Chat with AI Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Modal */}
          {showAiChat && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl h-[600px] shadow-2xl animate-scale-in">
                <EnhancedAiChat 
                  onClose={() => setShowAiChat(false)}
                  sessionId="home-session"
                />
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in">
            <div className="text-center p-6 card hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized flight recommendations with exclusive AI-only discounts up to 25% off!
              </p>
            </div>
            <div className="text-center p-6 card hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Best Prices</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Compare prices from multiple airlines and get the best deals with our AI assistant
              </p>
            </div>
            <div className="text-center p-6 card hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Instant Booking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Book directly from the AI chat or manually search - your choice!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
