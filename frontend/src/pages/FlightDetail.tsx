import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";

// Hardcoded occupied seats for realistic mockup
const occupiedSeats: string[] = [];

export default function FlightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [flight, setFlight] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Interactive Booking Selections
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [baggage, setBaggage] = useState<string>("15kg (Included)");
  const [meal, setMeal] = useState<string>("None");
  const [wifi, setWifi] = useState<string>("None");
  const [insurance, setInsurance] = useState<string>("None");

  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Add-on Cost Calculations (in Cents)
  const getSeatCost = (seat: string) => {
    if (!seat) return 0;
    const row = parseInt(seat.charAt(0));
    if (row <= 2) return 500000; // Business Class Row 1 & 2: +₹5,000.00
    return 80000; // Economy seat selection fee: +₹800.00
  };

  const getBaggageCost = (bag: string) => {
    if (bag.includes("25kg")) return 150000; // +₹1,500.00
    if (bag.includes("35kg")) return 300000; // +₹3,000.00
    return 0;
  };

  const getMealCost = (m: string) => {
    if (m === "Vegetarian Standard") return 45000; // +₹450.00
    if (m === "Non-Vegetarian Standard") return 60000; // +₹600.00
    if (m === "Vegan Choice") return 50000; // +₹500.00
    return 0;
  };

  const getWifiCost = (w: string) => {
    if (w === "Messaging Only") return 30000; // +₹300.00
    if (w === "Premium High Speed") return 100000; // +₹1,000.00
    return 0;
  };

  const getInsuranceCost = (ins: string) => {
    if (ins === "Basic Shield") return 49900; // +₹499.00
    if (ins === "Premium Cover") return 99900; // +₹999.00
    return 0;
  };

  const seatCost = selectedSeats.reduce((sum, seat) => sum + getSeatCost(seat), 0);
  const baggageCost = getBaggageCost(baggage);
  const mealCost = getMealCost(meal);
  const wifiCost = getWifiCost(wifi);
  const insuranceCost = getInsuranceCost(insurance);

  const getBasePrice = () => flight ? flight.basePriceCents : 0;
  const numSeats = selectedSeats.length || 1;
  const totalPriceCents = (getBasePrice() * numSeats) + seatCost + baggageCost + mealCost + wifiCost + insuranceCost;

  const totalFormatted = (totalPriceCents / 100).toFixed(2);

  const handleBook = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      showToast("warning", "Please select at least one seat from the seating map to proceed.");
      return;
    }

    setBooking(true);
    try {
      const r = await api.post("/bookings", {
        flightId: flight.id,
        seatNumber: selectedSeats.join(", "),
        luggageOption: baggage,
        mealOption: meal,
        wifiOption: wifi,
        insuranceOption: insurance,
        totalPriceCents: totalPriceCents
      });
      const b = r.data;
      const payload: any = { method: paymentMethod };
      if (paymentMethod === 'UPI') {
        if (!upiId.trim()) {
          showToast("warning", "Please enter your UPI ID");
          setBooking(false);
          return;
        }
        payload.upiId = upiId;
      }
      if (paymentMethod === 'CARD') {
        if (!cardNumber.trim() || !cardName.trim()) {
          showToast("warning", "Please fill in credit/debit card details");
          setBooking(false);
          return;
        }
        payload.cardNumber = cardNumber;
        payload.cardBrand = 'CARD';
      }
      await api.post(`/bookings/${b.id}/pay`, payload);
      showToast("success", "Payment successful. Booking confirmed!");
      navigate("/bookings");
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // Generate seating grid: 6 rows, columns A, B, C, D, E, F
  const renderSeatMap = () => {
    const rows = [1, 2, 3, 4, 5, 6];
    const cols = ["A", "B", "C", "D", "E", "F"];

    return (
      <div className="space-y-4 max-w-sm mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
        <div className="text-center font-bold text-xs uppercase tracking-wider text-gray-500 mb-4">
          Front of Aircraft
        </div>

        {/* Row loops */}
        {rows.map((row) => {
          const isBusiness = row <= 2;
          return (
            <div key={row} className="flex items-center justify-between">
              {/* Row number label */}
              <div className="w-6 text-xs font-bold text-gray-400 text-center">
                {row}
              </div>

              {/* Seat Columns */}
              <div className="flex items-center gap-2">
                {cols.map((col, idx) => {
                  const seatId = `${row}${col}`;
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  // Split seats with aisle between C and D
                  const aisleMargin = idx === 3 ? "ml-6" : "";

                  let seatStyle = "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-xs border transition-all duration-200 ";
                  if (isOccupied) {
                    seatStyle += "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-transparent";
                  } else if (isSelected) {
                    seatStyle += "bg-green-500 text-white border-green-600 shadow-md transform scale-105";
                  } else {
                    seatStyle += isBusiness
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800 hover:bg-purple-200"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-booking-lightblue/10 hover:border-booking-lightblue";
                  }

                  return (
                    <button
                      key={col}
                      disabled={isOccupied}
                      onClick={() => handleSeatClick(seatId)}
                      className={`${seatStyle} ${aisleMargin}`}
                      title={`${seatId} - ${isBusiness ? 'Business Class (+₹5,000)' : 'Economy Class (+₹800)'}`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-around text-xs mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 rounded"></div>
            <span>Business</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-white dark:bg-gray-900 border border-gray-300 rounded"></div>
            <span>Economy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>
    );
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
            {/* Flight Route Details Card */}
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
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Flight {flight.flightNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time progression route */}
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-6 items-center py-6 border-y border-gray-200 dark:border-gray-700">
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {formatTime(flight.departure)}
                  </div>
                  <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {flight.origin}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-505 leading-normal">
                    {formatDateTime(flight.departure)}
                  </div>
                </div>

                <div className="text-center w-full max-w-[200px] sm:max-w-none mx-auto">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    Duration: {getDuration(flight.departure, flight.arrival)}
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="mx-3 text-2xl">✈️</div>
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {formatTime(flight.arrival)}
                  </div>
                  <div className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {flight.destination}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-505 leading-normal">
                    {formatDateTime(flight.arrival)}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Seat Map Selection Card */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Select Your Seat
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Choose Business Class (Rows 1-2) for extra legroom and luxury (+₹5,000), or Economy Class (+₹800).
              </p>
              {renderSeatMap()}
            </div>

            {/* In-Flight Add-ons Selection Card */}
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                In-Flight Experience Add-ons
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Luggage Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🧳 Baggage Allowance
                  </label>
                  <select
                    value={baggage}
                    onChange={(e) => setBaggage(e.target.value)}
                    className="input-field"
                  >
                    <option value="15kg (Included)">15kg checked-in baggage (Included)</option>
                    <option value="25kg (+₹1,500)">25kg checked-in baggage (+₹1,500.00)</option>
                    <option value="35kg (+₹3,000)">35kg checked-in baggage (+₹3,000.00)</option>
                  </select>
                </div>

                {/* Hot Meal Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🍽 In-Flight Meal Option
                  </label>
                  <select
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="input-field"
                  >
                    <option value="None">No Meal (Included)</option>
                    <option value="Vegetarian Standard">Standard Hot Vegetarian Meal (+₹450.00)</option>
                    <option value="Non-Vegetarian Standard">Standard Hot Non-Veg Meal (+₹600.00)</option>
                    <option value="Vegan Choice">Vegan Gluten-Free Option (+₹500.00)</option>
                  </select>
                </div>

                {/* In-Flight Wi-Fi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📶 In-Flight Wi-Fi Packages
                  </label>
                  <select
                    value={wifi}
                    onChange={(e) => setWifi(e.target.value)}
                    className="input-field"
                  >
                    <option value="None">No Wi-Fi Connect (Offline)</option>
                    <option value="Messaging Only">Messaging Apps Only (+₹300.00)</option>
                    <option value="Premium High Speed">Full Internet & Streaming (+₹1,000.00)</option>
                  </select>
                </div>

                {/* Travel Insurance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🛡 Travel Insurance Shield
                  </label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="input-field"
                  >
                    <option value="None">Declined (No coverage)</option>
                    <option value="Basic Shield">Basic medical & flight delay shield (+₹499.00)</option>
                    <option value="Premium Cover">Premium fully comprehensive cover (+₹999.00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Price Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Base Flight Fare {selectedSeats.length > 1 ? `(x${selectedSeats.length})` : ""}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹{((getBasePrice() * numSeats) / 100).toFixed(2)}</span>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="flex justify-between items-center text-xs animate-fade-in text-gray-500">
                    <span>Seat Selection ({selectedSeats.join(", ")})</span>
                    <span>₹{(seatCost / 100).toFixed(2)}</span>
                  </div>
                )}
                {baggageCost > 0 && (
                  <div className="flex justify-between items-center text-xs animate-fade-in text-gray-500">
                    <span>Extra Baggage</span>
                    <span>₹{(baggageCost / 100).toFixed(2)}</span>
                  </div>
                )}
                {mealCost > 0 && (
                  <div className="flex justify-between items-center text-xs animate-fade-in text-gray-500">
                    <span>Meal Add-on</span>
                    <span>₹{(mealCost / 100).toFixed(2)}</span>
                  </div>
                )}
                {wifiCost > 0 && (
                  <div className="flex justify-between items-center text-xs animate-fade-in text-gray-500">
                    <span>Wi-Fi Package</span>
                    <span>₹{(wifiCost / 100).toFixed(2)}</span>
                  </div>
                )}
                {insuranceCost > 0 && (
                  <div className="flex justify-between items-center text-xs animate-fade-in text-gray-500">
                    <span>Travel Insurance</span>
                    <span>₹{(insuranceCost / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-800 dark:text-gray-200">Grand Total</span>
                    <span className="text-2xl font-bold text-booking-lightblue">₹{totalFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">Payment Gateway</div>

                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border ${paymentMethod === 'UPI'
                        ? 'bg-booking-lightblue text-white border-booking-lightblue'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    UPI Payment
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border ${paymentMethod === 'CARD'
                        ? 'bg-booking-lightblue text-white border-booking-lightblue'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    Credit / Debit Card
                  </button>
                </div>

                {paymentMethod === 'UPI' ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="UPI ID (e.g., name@bank)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input-field text-xs py-2.5"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input-field text-xs py-2.5"
                    />
                    <input
                      type="text"
                      placeholder="Card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field text-xs py-2.5"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="input-field text-xs py-2.5"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="input-field text-xs py-2.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full btn-primary text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-wider flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  'Pay & Confirm Reservation'
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center">
                Secure SSL Encryption • Instant Boarding Pass Generation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
