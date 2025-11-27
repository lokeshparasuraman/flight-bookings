import { useState } from "react";
import EnhancedAiChat from "./EnhancedAiChat";

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-booking-lightblue to-booking-blue text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <span className="text-2xl md:text-3xl">🤖</span>
          <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            <span className="absolute w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full animate-ping"></span>
            <span className="relative text-white text-[10px] md:text-xs">AI</span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 h-[85vh] md:h-[600px] z-50 animate-scale-in shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden">
            <EnhancedAiChat onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}

