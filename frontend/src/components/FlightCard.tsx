import { Link } from "react-router-dom";

export default function FlightCard({ f, origin, destination }: any) {
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

  const price = (f.basePriceCents / 100).toFixed(2);
  const flightOrigin = f.origin || origin || 'N/A';
  const flightDest = f.destination || destination || 'N/A';

  return (
    <div className="card p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Flight Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {f.airline.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    {f.airline}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {f.flightNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Times */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Departure */}
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatTime(f.departure)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {flightOrigin}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(f.departure)}
              </div>
            </div>

            {/* Duration */}
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {getDuration(f.departure, f.arrival)}
              </div>
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="mx-2 text-gray-400">✈️</div>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatTime(f.arrival)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {flightDest}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(f.arrival)}
              </div>
            </div>
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="flex flex-col items-end justify-between md:min-w-[180px] border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
          <div className="mb-4">
            <div className="text-3xl font-bold text-booking-lightblue mb-1">
              ₹{price}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              per person
            </div>
          </div>
          <Link
            to={`/flight/${f.id}`}
            className="btn-primary w-full md:w-auto text-center"
          >
            Select
          </Link>
        </div>
      </div>
    </div>
  );
}
