import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api, { setAuthToken } from "../services/api";
import { useToast } from "../contexts/ToastContext";

export default function Bookings() {
  const nav = useNavigate();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  const handleToggleAll = () => {
    const activeBookings = bookings.filter(b => b.status === "CONFIRMED");
    const activeIds = activeBookings.map(b => b.id);
    if (selectedBookingIds.length === activeIds.length) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(activeIds);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedBookingIds.includes(id)) {
      setSelectedBookingIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedBookingIds(prev => [...prev, id]);
    }
  };

  const handlePrintSingle = (id: string) => {
    const prev = [...selectedBookingIds];
    setSelectedBookingIds([id]);
    setTimeout(() => {
      window.print();
      setSelectedBookingIds(prev);
    }, 100);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const loadBookings = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        nav("/login");
        return;
      }
      setAuthToken(token);
      
      const r = await api.get("/bookings/me");
      const data = Array.isArray(r.data) ? r.data : [];
      // Sort by booking created date, newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(data);
      setSelectedBookingIds(data.filter((bk: any) => bk.status === "CONFIRMED").map((bk: any) => bk.id));
      setLoaded(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load bookings. Please verify authentication.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    setAuthToken(token);
    setError("");
    if (!confirm("Are you sure you want to cancel this flight and receive a full refund?")) {
      return;
    }
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
      setSelectedBookingIds(prev => prev.filter(item => item !== id));
      showToast("success", "Reservation cancelled successfully. A refund has been issued.");
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.error || "Failed to cancel booking.");
      showToast("error", err?.response?.data?.error || "Failed to cancel booking.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadBookings();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const renderBookingCard = (b: any, idx: number) => {
    const f = b.flight || {};
    const isConfirmed = b.status === "CONFIRMED";
    const isCancelled = b.status === "CANCELLED";
    
    const seats = (b.seatNumber || "").split(", ").filter((s: string) => s.trim().length > 0);
    const hasBusiness = seats.some((s: string) => s.startsWith("1") || s.startsWith("2"));
    const hasEconomy = seats.some((s: string) => !s.startsWith("1") && !s.startsWith("2") && s.trim().length > 0);
    
    let classText = "Economy Class";
    if (hasBusiness && hasEconomy) {
      classText = "Business & Economy";
    } else if (hasBusiness) {
      classText = "Business Class";
    }

    return (
      <div
        key={b.id || idx}
        className={`relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-soft-lg overflow-hidden flex flex-col md:flex-row print:border-black print:text-black print:shadow-none animate-slide-up print:break-inside-avoid ${
          selectedBookingIds.includes(b.id) ? "" : "print:hidden"
        } ${isCancelled ? "border-dashed border-red-200/50 dark:border-red-950/20 bg-gray-50/50 dark:bg-gray-900/10" : ""}`}
        style={{ animationDelay: `${idx * 0.08}s` }}
      >
        {/* Left Side: Main Boarding Pass */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {/* Header bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`text-2xl print:text-black ${isCancelled ? "text-gray-400" : "text-booking-lightblue"}`}>✈️</span>
              <span className={`font-extrabold tracking-wider uppercase text-sm ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
                FlyFast Airlines
              </span>
            </div>
            
            <div className="flex items-center gap-3 print:hidden">
              {isConfirmed && !isCancelled && (
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={selectedBookingIds.includes(b.id)}
                    onChange={() => handleToggleSelect(b.id)}
                    className="w-4 h-4 rounded text-booking-lightblue focus:ring-booking-lightblue border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <span>Print</span>
                </label>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                isCancelled 
                  ? "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                  : hasBusiness 
                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" 
                    : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              }`}>
                {classText}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                isConfirmed 
                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                  : isCancelled
                    ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
              }`}>
                {b.status}
              </span>
            </div>
          </div>

          {/* Flight Path (Origin and Destination codes) */}
          <div className="flex justify-between items-center gap-4 py-4 border-y border-gray-100 dark:border-gray-700 print:border-black">
            <div>
              <div className={`text-4xl md:text-5xl font-extrabold ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-booking-lightblue"}`}>
                {f.origin}
              </div>
              <div className="text-xs text-gray-500 font-semibold mt-1">
                DEPARTURE: {formatTime(f.departure)}
              </div>
              <div className="text-[10px] text-gray-400">
                {formatDate(f.departure)}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">
                Flight {f.flightNumber}
              </span>
              <div className="w-full flex items-center relative">
                <div className="flex-1 h-px border-t border-dashed border-gray-300 dark:border-gray-600 print:border-black"></div>
                <div className="mx-2 text-xl text-gray-400 dark:text-gray-500 print:text-black">✈️</div>
                <div className="flex-1 h-px border-t border-dashed border-gray-300 dark:border-gray-600 print:border-black"></div>
              </div>
              <span className={`text-[10px] font-bold mt-1 ${isCancelled ? "text-gray-400" : "text-booking-lightblue"}`}>
                NON-STOP
              </span>
            </div>

            <div className="text-right">
              <div className={`text-4xl md:text-5xl font-extrabold ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-booking-lightblue"}`}>
                {f.destination}
              </div>
              <div className="text-xs text-gray-500 font-semibold mt-1">
                ARRIVAL: {formatTime(f.arrival)}
              </div>
              <div className="text-[10px] text-gray-400">
                {formatDate(f.arrival)}
              </div>
            </div>
          </div>

          {/* Passenger & Gate details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">PASSENGER NAME</span>
              <span className={`font-bold ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>Lokesh Parasuraman</span>
            </div>
            
            <div>
              <span className="text-gray-400 block mb-0.5">SEAT NUMBER</span>
              <span className={`font-extrabold text-sm ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-booking-lightblue"}`}>
                {b.seatNumber || "—"}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">BOARDING GATE</span>
              <span className={`font-bold ${isCancelled ? "text-gray-450 dark:text-gray-550" : "text-gray-800 dark:text-gray-200"}`}>G-12</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">BOARDING TIME</span>
              <span className={`font-bold ${isCancelled ? "text-gray-450 dark:text-gray-550" : "text-gray-800 dark:text-gray-200"}`}>
                {(() => {
                  const dep = new Date(f.departure);
                  dep.setMinutes(dep.getMinutes() - 40);
                  return dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                })()}
              </span>
            </div>
          </div>

          {/* Flight Add-ons details footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 print:border-black flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500 dark:text-gray-400">
            <div>🍽 Meal: <span className="font-semibold text-gray-700 dark:text-gray-300">{b.mealOption || "None"}</span></div>
            <div>🧳 Baggage: <span className="font-semibold text-gray-700 dark:text-gray-300">{b.luggageOption || "15kg (Included)"}</span></div>
            <div>📶 Wi-Fi: <span className="font-semibold text-gray-700 dark:text-gray-300">{b.wifiOption || "None"}</span></div>
            <div>🛡 Insurance: <span className="font-semibold text-gray-700 dark:text-gray-300">{b.insuranceOption || "None"}</span></div>
          </div>
        </div>

        {/* Dotted Separator Line for ticket stub */}
        <div className="hidden md:flex flex-col items-center justify-between py-4 relative print:flex">
          <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-700 rounded-full -mt-6 absolute top-0 print:bg-white print:border-black"></div>
          <div className="w-px h-full border-l border-dashed border-gray-300 dark:border-gray-600 print:border-black"></div>
          <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border-t border-r border-gray-200 dark:border-gray-700 rounded-full -mb-6 absolute bottom-0 print:bg-white print:border-black"></div>
        </div>
        <div className="flex md:hidden items-center justify-between px-4 relative w-full print:hidden">
          <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rounded-full -ml-2 absolute left-0"></div>
          <div className="w-full h-px border-t border-dashed border-gray-300 dark:border-gray-600"></div>
          <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border-l border-b border-gray-200 dark:border-gray-700 rounded-full -mr-2 absolute right-0"></div>
        </div>

        {/* Right Side: Ticket Stub & Barcode */}
        <div className="w-full md:w-56 bg-gray-50/50 dark:bg-gray-800/30 p-6 md:p-8 flex flex-col justify-between items-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 print:border-black print:text-black">
          <div className="w-full text-center space-y-4">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              BOARDING PASS STUB
            </div>
            
            <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-gray-700 pb-2 print:border-black">
              <div>
                <span className="text-[10px] text-gray-400 block">FLIGHT</span>
                <span className="font-bold">{f.flightNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">SEAT</span>
                <span className={`font-extrabold ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-booking-lightblue"}`}>{b.seatNumber || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">GATE</span>
                <span className="font-bold">G-12</span>
              </div>
            </div>

            <div className={`flex justify-between items-center text-sm py-1 font-extrabold ${isCancelled ? "text-gray-400 dark:text-gray-500" : "text-booking-lightblue"}`}>
              <span>{f.origin}</span>
              <span>→</span>
              <span>{f.destination}</span>
            </div>
          </div>

          {/* Barcode graphic */}
          <div className="w-full mt-6 space-y-1">
            <div className="h-10 w-full flex items-center justify-center gap-0.5 overflow-hidden">
              {[
                1, 2, 0.5, 3, 1, 0.5, 2.5, 1.5, 0.5, 2, 1, 3, 0.5, 1, 2.5, 0.5, 2, 1, 1.5,
                2, 1, 0.5, 3, 1, 0.5, 2.5, 1.5, 0.5, 2, 1, 3, 0.5, 1, 2.5, 0.5, 2, 1, 1.5
              ].map((width, i) => (
                <div
                  key={i}
                  className={`print:bg-black h-full ${isCancelled ? "bg-gray-400 dark:bg-gray-600 opacity-20" : "bg-gray-800 dark:bg-gray-300"}`}
                  style={{ width: `${width}px` }}
                ></div>
              ))}
            </div>
            <div className="text-[8px] text-gray-400 dark:text-gray-500 font-mono tracking-widest text-center">
              {b.id.slice(0, 8).toUpperCase()}-{b.userId.slice(0, 4).toUpperCase()}
            </div>
          </div>

          {/* print:hidden actions */}
          {isConfirmed && !isCancelled && (
            <div className="w-full mt-4 flex gap-2 print:hidden">
              <button
                onClick={() => handlePrintSingle(b.id)}
                className="w-full py-1.5 bg-booking-lightblue/10 hover:bg-booking-lightblue/20 text-booking-lightblue border border-booking-lightblue/30 rounded-lg text-xs font-semibold transition-colors duration-200"
              >
                🖨 Print Ticket
              </button>
              <button
                onClick={() => cancelBooking(b.id)}
                className="w-full py-1.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs font-semibold transition-colors duration-200"
              >
                Cancel Booking
              </button>
            </div>
          )}

          {isCancelled && (
            <div className="w-full mt-4 text-center py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider print:hidden">
              ❌ Cancelled & Refunded
            </div>
          )}
        </div>
      </div>
    );
  };

  const activeBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING");
  const cancelledBookings = bookings.filter(b => b.status === "CANCELLED");

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 print:bg-white print:text-black">
      {/* Background Animations */}
      <div className="bg-blobs print:hidden">
        <div className="grid-pattern" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="relative z-10">
        <div className="print:hidden">
          <Header />
        </div>
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
              Your Flight Tickets
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your active reservations and display digital boarding passes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={selectedBookingIds.length === 0}
              className="btn-secondary py-2 px-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🖨 Print Passes {selectedBookingIds.length > 0 ? `(${selectedBookingIds.length})` : ""}
            </button>
            <button
              onClick={loadBookings}
              disabled={loading}
              className="btn-primary py-2 px-4 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900 print:hidden">
            {error}
          </div>
        )}

        {loading && bookings.length === 0 && (
          <div className="flex justify-center items-center py-20 print:hidden">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-booking-lightblue"></div>
          </div>
        )}

        {!loading && loaded && bookings.length === 0 && (
          <div className="card p-12 text-center max-w-lg mx-auto print:hidden animate-scale-in">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No flights booked yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't reserved any flights yet. Let's find your next destination!
            </p>
            <button
              onClick={() => nav("/")}
              className="btn-primary py-2 px-6"
            >
              Search Flights
            </button>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Print Selection Bar */}
            {activeBookings.filter(b => b.status === "CONFIRMED").length > 0 && (
              <div className="p-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="select-all-bookings"
                    checked={selectedBookingIds.length === activeBookings.filter(b => b.status === "CONFIRMED").length}
                    onChange={handleToggleAll}
                    className="w-5 h-5 rounded text-booking-lightblue focus:ring-booking-lightblue border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                  />
                  <label htmlFor="select-all-bookings" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    Select All Active Tickets ({selectedBookingIds.length}/{activeBookings.filter(b => b.status === "CONFIRMED").length} selected to print)
                  </label>
                </div>
                {selectedBookingIds.length > 0 && (
                  <span className="text-xs text-booking-lightblue font-bold uppercase animate-fade-in flex items-center gap-1">
                    <span>🖨</span> Ready to Print
                  </span>
                )}
              </div>
            )}

            {/* Active Bookings List */}
            {activeBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-850 dark:text-gray-200 flex items-center gap-2 print:hidden mb-4">
                  <span className="text-green-500">🎫</span> Active Reservations ({activeBookings.length})
                </h2>
                <div className="space-y-6">
                  {activeBookings.map((b, idx) => renderBookingCard(b, idx))}
                </div>
              </div>
            )}

            {/* Cancelled Bookings List */}
            {cancelledBookings.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 print:hidden mb-4">
                  <span className="text-red-500/80">❌</span> Cancelled Reservations ({cancelledBookings.length})
                </h2>
                <div className="space-y-6 opacity-75 dark:opacity-60 transition-opacity duration-300">
                  {cancelledBookings.map((b, idx) => renderBookingCard(b, idx + activeBookings.length))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
