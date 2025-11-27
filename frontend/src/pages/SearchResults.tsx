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
    setLoading(true);
    api.get("/flights/search", { params: { origin, destination, date } })
      .then((r) => setFlights(r.data))
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  }, [origin, destination, date]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate("/")}
            className="text-booking-lightblue hover:text-booking-blue mb-4 flex items-center space-x-2 transition-colors duration-200"
          >
            <span>←</span>
            <span>Back to search</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Flights from {origin} to {destination}
          </h1>
          {date && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {formatDate(date)}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
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
            {flights.length === 0 ? (
              <div className="card p-12 text-center animate-scale-in">
                <div className="text-6xl mb-4">✈️</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  No flights found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or dates
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="btn-primary"
                >
                  Search Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((f, index) => (
                  <div
                    key={f.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
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
        {!loading && flights.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <div className="card p-6">
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
  );
}
