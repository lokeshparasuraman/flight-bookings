import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FlightIcon, HeartIcon } from "./Icons";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function FlightCard({ f, origin, destination, specialFare = "regular", fareDiscountPct = 0 }: any) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wl.some((x: any) => x.id === f.id));
    } catch (e) {
      setIsWishlisted(false);
    }
    
    const handleSync = () => {
      try {
        const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setIsWishlisted(wl.some((x: any) => x.id === f.id));
      } catch (e) {
        setIsWishlisted(false);
      }
    };
    window.addEventListener("wishlistUpdated", handleSync);
    return () => window.removeEventListener("wishlistUpdated", handleSync);
  }, [f.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const idx = wl.findIndex((x: any) => x.id === f.id);
      let updated = [];
      if (idx > -1) {
        updated = wl.filter((x: any) => x.id !== f.id);
        setIsWishlisted(false);
        showToast("info", t("remove_from_wishlist"));
      } else {
        updated = [...wl, f];
        setIsWishlisted(true);
        showToast("success", t("add_to_wishlist"));
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (e) {
      showToast("error", "Failed to update wishlist");
    }
  };
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getAirlineColor = (airline: string) => {
    switch (airline.toLowerCase()) {
      case 'indigo':
        return 'from-blue-600 to-blue-800 shadow-blue-500/20';
      case 'air india':
      case 'air india express':
        return 'from-red-500 to-orange-600 shadow-red-500/20';
      case 'vistara':
        return 'from-indigo-900 via-purple-950 to-purple-800 shadow-indigo-900/20';
      case 'spicejet':
        return 'from-orange-500 to-red-500 shadow-orange-500/20';
      case 'akasa air':
        return 'from-orange-400 to-amber-500 shadow-amber-500/20';
      default:
        return 'from-zinc-600 to-zinc-800 shadow-zinc-700/10';
    }
  };

  // Discounted price in cents (rounded), or original if no fare concession
  const discountedCents = Math.round(f.basePriceCents * (1 - fareDiscountPct / 100));
  const price = (discountedCents / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  const originalPrice = (f.basePriceCents / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  const flightOrigin = f.origin || origin || 'N/A';
  const flightDest = f.destination || destination || 'N/A';

  return (
    <div className="card p-6 hover:scale-[1.01] hover:border-booking-lightblue/30 dark:hover:border-booking-lightblue/30 transition-all duration-300 border border-gray-100 dark:border-gray-800/80 shadow-soft backdrop-blur-md bg-white/90 dark:bg-gray-800/90 relative overflow-hidden group">
      {/* Visual Accent Hover Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-booking-lightblue to-booking-blue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      
      {/* Wishlist toggle button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-4 right-4 z-20 p-2.5 bg-gray-50/80 dark:bg-gray-750/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-all focus:outline-none flex items-center justify-center shadow-sm"
        aria-label="Add to Wishlist"
      >
        <HeartIcon className={`w-4.5 h-4.5 ${isWishlisted ? "text-red-500 fill-current scale-110" : "text-gray-400 dark:text-gray-500"} transition-all duration-200`} />
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10 pr-6">
        {/* Flight Details section */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center space-x-3.5">
              <div className={`w-11 h-11 bg-gradient-to-br ${getAirlineColor(f.airline)} rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-md`}>
                {f.airline.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 leading-tight">
                  {f.airline}
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase">
                  {f.flightNumber}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mr-6">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 rounded-lg">
                {t("non_stop")}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                {t("live_status")}
              </span>
            </div>
          </div>

          {/* Flight Times Timeline */}
          <div className="grid grid-cols-3 gap-2 items-center px-2">
            {/* Departure details */}
            <div className="text-left">
              <span className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100 font-display">
                {formatTime(f.departure)}
              </span>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {flightOrigin}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {formatDate(f.departure)}
              </div>
            </div>

            {/* Flight Duration Line */}
            <div className="text-center px-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
                {getDuration(f.departure, f.arrival)}
              </span>
              <div className="relative flex items-center justify-center my-1.5">
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                <div className="absolute text-gray-400/80 bg-white dark:bg-gray-800 px-2 text-sm group-hover:text-booking-lightblue group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <FlightIcon className="w-4 h-4 text-booking-lightblue transform -rotate-45" />
                </div>
              </div>
              <span className="text-[9px] text-booking-lightblue dark:text-booking-lightblue/80 font-bold tracking-wider uppercase">
                {t("economy")}
              </span>
            </div>

            {/* Arrival details */}
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100 font-display">
                {formatTime(f.arrival)}
              </span>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {flightDest}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {formatDate(f.arrival)}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing / Booking column */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center md:min-w-[170px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700/60 pt-4 md:pt-0 md:pl-6 gap-4">
          <div className="text-left md:text-right">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">
              {t("fare_starting")}
            </span>
            {/* Show original price struck-through when a fare discount is active */}
            {fareDiscountPct > 0 && (
              <div className="text-sm text-gray-400 dark:text-gray-500 line-through font-semibold">
                ₹{originalPrice}
              </div>
            )}
            <div className="text-3xl font-extrabold text-booking-lightblue dark:text-booking-lightblue font-display tracking-tight">
              ₹{price}
            </div>
            {fareDiscountPct > 0 && (
              <span className="text-[10px] font-extrabold text-green-500 block">
                -{fareDiscountPct}% {specialFare === 'armed' ? '🎖️' : specialFare === 'student' ? '🎓' : specialFare === 'senior' ? '🧓' : specialFare === 'gst' ? '🏢' : ''} concession
              </span>
            )}
            <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
              {t("taxes_fees")}
            </span>
          </div>
          
          {/* Carry the specialFare forward so FlightDetail applies the same discount */}
          <Link
            to={`/flight/${f.id}${specialFare && specialFare !== 'regular' ? `?specialFare=${specialFare}` : ''}`}
            className="btn-primary py-2.5 px-6 rounded-xl text-sm font-bold shadow-soft hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center w-auto min-w-[110px]"
          >
            {t("select_flight")}
          </Link>
        </div>
      </div>
    </div>
  );
}
