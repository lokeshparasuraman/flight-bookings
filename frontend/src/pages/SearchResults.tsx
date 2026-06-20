import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import FlightCard from "../components/FlightCard";
import Header from "../components/Header";
import EnhancedAiChat from "../components/EnhancedAiChat";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const q = useQuery();
  const navigate = useNavigate();
  const origin = q.get("origin") || "DEL";
  const destination = q.get("destination") || "BOM";
  const date = q.get("date") || "";
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get("/flights/search", { params: { origin, destination, date } })
      .then((r) => setFlights(r.data))
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  }, [origin, destination, date]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Only display live flights that have not yet departed relative to current real-time
  const liveFlights = flights.filter((f) => new Date(f.departure).getTime() > Date.now());

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Background Animations */}
      <div className="bg-blobs">
        <div className="grid-pattern" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="container py-12 max-w-5xl">
          {/* Header Section */}
          <div className="mb-10 animate-fade-in">
            <button
              onClick={() => navigate("/routes")}
              className="text-booking-lightblue hover:text-booking-blue mb-4 flex items-center space-x-2 transition-all duration-200 font-semibold"
            >
              <span>←</span>
              <span>Back to routes</span>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Flights from <span className="bg-gradient-to-r from-booking-blue to-booking-lightblue bg-clip-text text-transparent">{origin}</span> to <span className="bg-gradient-to-r from-booking-lightblue to-booking-blue bg-clip-text text-transparent">{destination}</span>
                </h1>
                {date && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    📅 {formatDate(date)}
                  </p>
                )}
              </div>
              <div className="inline-flex self-start md:self-auto items-center px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full border border-green-500/20 shadow-sm backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2.5 animate-pulse relative flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                </span>
                {liveFlights.length} Live {liveFlights.length === 1 ? 'Flight' : 'Flights'} Available
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-booking-lightblue"></div>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <>
              {liveFlights.length === 0 ? (
                <div className="card p-12 text-center animate-scale-in max-w-lg mx-auto border border-gray-100 dark:border-gray-800">
                  <div className="text-6xl mb-4">✈️</div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    No live flights found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    All flights on this route for today have already departed or none are scheduled.
                  </p>
                  <button
                    onClick={() => navigate("/routes")}
                    className="btn-primary"
                  >
                    Explore Other Routes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveFlights.map((f, index) => (
                    <div
                      key={f.id}
                      style={{ animationDelay: `${index * 0.08}s` }}
                      className="animate-slide-up"
                    >
                      <FlightCard f={f} origin={origin} destination={destination} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* AI Chat Section */}
          {!loading && liveFlights.length > 0 && (
            <div className="mt-12 animate-fade-in">
              <div className="card p-6 border border-gray-100 dark:border-gray-800 shadow-soft-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Get AI recommendations with exclusive discounts!</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ask our AI assistant to find better deals or alternative flights with special discounts.
                </p>
                <EnhancedAiChat sessionId={`session-${origin}-${destination}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
