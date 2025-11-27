import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api, { setAuthToken, checkHealth } from "../services/api";

export default function Bookings() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [serviceOk, setServiceOk] = useState<boolean | null>(null);
  const [serviceChecking, setServiceChecking] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const loadBookings = async () => {
    setServiceChecking(true);
    const ok = await checkHealth();
    setServiceOk(ok);
    setServiceChecking(false);
    if (!ok) {
      setError("Service unavailable. Please try again later.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    setAuthToken(token);
    setError("");
    setLoading(true);
    try {
      const r = await api.get("/bookings/me");
      const data = Array.isArray(r.data) ? r.data : [];
      // Sort by booking created date, newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(data);
      setLoaded(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (serviceOk === false) return;
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    setAuthToken(token);
    setError("");
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to cancel booking.");
    }
  };

  useEffect(() => {
    (async () => {
      setServiceChecking(true);
      const ok = await checkHealth();
      setServiceOk(ok);
      setServiceChecking(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container py-8">
        <div className="card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Bookings</h1>
          <button
              onClick={loadBookings}
              disabled={loading || serviceOk === false || serviceChecking}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : serviceChecking ? "Checking..." : "Load My Bookings"}
            </button>
          <div className="ml-4">
            {serviceOk === true && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">All systems operational</span>
            )}
            {serviceOk === false && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">Service unavailable</span>
            )}
          </div>
        </div>

          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}

          {!loading && loaded && bookings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🗒️</div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                No flights booked yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Book a flight to see it here.
              </p>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((b, idx) => {
                const f = b.flight || {};
                return (
                  <div
                    key={b.id || idx}
                    className="card p-4 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {(f.airline || "F")[0]}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                            {f.airline || "Unknown Airline"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {f.flightNumber || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Booked on {formatDate(b.createdAt)} at {formatTime(b.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Status: {b.status}
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => cancelBooking(b.id)}
                            disabled={serviceOk === false}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg text-xs"
                          >
                            Cancel & Refund
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {formatTime(f.departure)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                          {f.origin}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(f.departure)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center">
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                          <div className="mx-2 text-lg">✈️</div>
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {formatTime(f.arrival)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                          {f.destination}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(f.arrival)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
