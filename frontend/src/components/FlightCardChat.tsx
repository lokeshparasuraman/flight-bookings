import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { formatTime, formatShortDate as formatDate, getDuration } from "../utils/dateUtils";

interface FlightCardChatProps {
  flight: any;
  discount?: number;
  offerText?: string;
  origin?: string;
  destination?: string;
  onBook?: () => void;
}

export default function FlightCardChat({ 
  flight, 
  discount = 0, 
  offerText,
  origin,
  destination,
  onBook 
}: FlightCardChatProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  

  const basePrice = flight.basePriceCents / 100;
  const discountedPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  const savings = discount > 0 ? basePrice - discountedPrice : 0;

  const flightOrigin = flight.origin || origin || 'N/A';
  const flightDest = flight.destination || destination || 'N/A';

  const handleQuickBook = async () => {
    if (onBook) {
      onBook();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.post("/bookings", { flightId: flight.id });
      showToast("success", "Booking successful! 🎉");
      navigate("/");
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Booking failed. Please try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-booking-lightblue/20 shadow-lg hover:shadow-xl transition-all duration-300 my-3 overflow-hidden">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 text-sm font-bold flex items-center justify-between">
          <span>🎉 {discount}% OFF - Special AI Offer!</span>
          {savings > 0 && (
            <span className="text-xs">Save ₹{savings.toFixed(2)}</span>
          )}
        </div>
      )}

      {offerText && !discount && (
        <div className="bg-gradient-to-r from-booking-lightblue to-booking-blue text-white px-4 py-2 text-sm font-semibold">
          {offerText}
        </div>
      )}

      <div className="p-4">
        {/* Flight Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {flight.airline.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                {flight.airline}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {flight.flightNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Flight Route */}
        <div className="grid grid-cols-3 gap-3 items-center mb-4 py-3 border-y border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {formatTime(flight.departure)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              {flightOrigin}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(flight.departure)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {getDuration(flight.departure, flight.arrival)}
            </div>
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="mx-2 text-lg">✈️</div>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {formatTime(flight.arrival)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              {flightDest}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(flight.arrival)}
            </div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            {discount > 0 ? (
              <>
                <div className="text-xs text-gray-500 line-through">₹{basePrice.toFixed(2)}</div>
                <div className="text-2xl font-bold text-booking-lightblue">
                  ₹{discountedPrice.toFixed(2)}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-booking-lightblue">
                ₹{basePrice.toFixed(2)}
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400">per person</div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/flight/${flight.id}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
            >
              View
            </Link>
            <button
              onClick={handleQuickBook}
              className="px-4 py-2 bg-gradient-to-r from-booking-lightblue to-booking-blue hover:from-booking-blue hover:to-booking-lightblue text-white font-bold rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(0,140,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,140,255,0.35)] hover:scale-105 active:scale-95 text-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

