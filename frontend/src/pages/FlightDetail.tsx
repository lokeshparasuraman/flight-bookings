import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

export default function FlightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/flights/${id}`)
      .then((r) => setFlight(r.data))
      .catch(() => setFlight(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleBook = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setBooking(true);
    try {
      const r = await api.post("/bookings", { flightId: flight.id });
      const b = r.data;
      const payload: any = { method: paymentMethod };
      if (paymentMethod === 'UPI') payload.upiId = upiId;
      if (paymentMethod === 'CARD') {
        payload.cardNumber = cardNumber;
        payload.cardBrand = 'CARD';
      }
      await api.post(`/bookings/${b.id}/pay`, payload);
      alert("Payment successful. Booking confirmed.");
      navigate("/");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container py-20">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-booking-lightblue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container py-20">
          <div className="card p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Flight not found
            </h2>
            <button
              onClick={() => navigate("/")}
              className="btn-primary mt-6"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const price = (flight.basePriceCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-booking-lightblue hover:text-booking-blue mb-6 flex items-center space-x-2 transition-colors duration-200 animate-fade-in"
        >
          <span>←</span>
          <span>Back to results</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up">
            {/* Flight Header */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {flight.airline.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {flight.airline}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      Flight {flight.flightNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight Route */}
              <div className="grid grid-cols-3 gap-6 items-center py-6 border-y border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {formatTime(flight.departure)}
                  </div>
                  <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {flight.origin}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {formatDateTime(flight.departure)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Duration: {getDuration(flight.departure, flight.arrival)}
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="mx-3 text-2xl">✈️</div>
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {formatTime(flight.arrival)}
                  </div>
                  <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {flight.destination}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {formatDateTime(flight.arrival)}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Flight Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Route</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {flight.origin} → {flight.destination}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Airline</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {flight.airline}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Flight Number</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {flight.flightNumber}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {getDuration(flight.departure, flight.arrival)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Price Summary
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Base Fare</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹{price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Taxes & Fees</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹0.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Total</span>
                    <span className="text-2xl font-bold text-booking-lightblue">₹{price}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Payment Method</div>
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-3 py-2 rounded-lg border ${paymentMethod === 'UPI' ? 'bg-booking-lightblue text-white border-booking-lightblue' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    UPI
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg border ${paymentMethod === 'CARD' ? 'bg-booking-lightblue text-white border-booking-lightblue' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    Card
                  </button>
                </div>
                {paymentMethod === 'UPI' ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="UPI ID (e.g., name@bank)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input-field"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="input-field"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Processing...' : 'Pay & Book'}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                Secure payment • Instant confirmation • 24/7 support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
