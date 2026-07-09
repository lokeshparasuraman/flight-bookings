import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { MealIcon, BaggageIcon, WifiIcon, ShieldIcon } from "../components/Icons";
import Footer from "../components/Footer";
import { formatTime, getDuration } from "../utils/dateUtils";

// Hardcoded occupied seats for realistic mockup
const occupiedSeats: string[] = [];

export default function FlightDetail() {
    const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const returnFlightId = queryParams.get("returnFlightId");
  const specialFare = queryParams.get("specialFare") || "regular";

  /**
   * SPECIAL_FARE_DISCOUNTS — mirrors Home.tsx concession data.
   * Applied to basePriceCents before all totals are computed.
   */
  const SPECIAL_FARE_DISCOUNTS: Record<string, { discountPct: number; label: string; icon: string }> = {
    regular: { discountPct: 0,  label: "Regular Fare",       icon: "✈️" },
    student: { discountPct: 10, label: "Student Fare (-10%)",        icon: "🎓" },
    armed:   { discountPct: 50, label: "Armed Forces Fare (-50%)",   icon: "🎖️" },
    senior:  { discountPct: 10, label: "Senior Citizen Fare (-10%)", icon: "🧓" },
    gst:     { discountPct: 5,  label: "GST Business Fare (-5%)",    icon: "🏢" },
  };
  const fareInfo = SPECIAL_FARE_DISCOUNTS[specialFare] ?? SPECIAL_FARE_DISCOUNTS["regular"];
  const applyFareDiscount = (cents: number) =>
    Math.round(cents * (1 - fareInfo.discountPct / 100));

  const [flight, setFlight] = useState<any | null>(null);
  const [returnFlight, setReturnFlight] = useState<any | null>(null);
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
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<string[]>([]);
  const [passengerNames, setPassengerNames] = useState<string[]>([]);
  const [baggage, setBaggage] = useState<string>("15kg (Included)");
  const [meal, setMeal] = useState<string>("None");
  const [wifi, setWifi] = useState<string>("None");
  const [insurance, setInsurance] = useState<string>("None");

  const handleSeatClick = (seatId: string, type: 'outbound' | 'return') => {
    if (type === 'outbound') {
      if (selectedSeats.includes(seatId)) {
        setSelectedSeats(selectedSeats.filter(s => s !== seatId));
      } else {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    } else {
      if (selectedReturnSeats.includes(seatId)) {
        setSelectedReturnSeats(selectedReturnSeats.filter(s => s !== seatId));
      } else {
        setSelectedReturnSeats([...selectedReturnSeats, seatId]);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    setLoading(true);

    const fetchOutbound = api.get(`/flights/${id}`)
      .then((r) => setFlight(r.data))
      .catch(() => setFlight(null));

    const fetchReturn = returnFlightId
      ? api.get(`/flights/${returnFlightId}`)
          .then((r) => setReturnFlight(r.data))
          .catch(() => setReturnFlight(null))
      : Promise.resolve();

    Promise.all([fetchOutbound, fetchReturn])
      .finally(() => setLoading(false));
  }, [id, returnFlightId]);

  

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

  // Outbound costs — base price has fare concession applied first
  const seatCost = selectedSeats.reduce((sum, seat) => sum + getSeatCost(seat), 0);
  const outboundBasePrice = flight ? applyFareDiscount(flight.basePriceCents) : 0;
  const numOutboundSeats = selectedSeats.length || 1;
  const outboundTotalCents = (outboundBasePrice * numOutboundSeats) + seatCost;

  // Return costs (if return flight selected) — same concession applied
  const returnSeatCost = selectedReturnSeats.reduce((sum, seat) => sum + getSeatCost(seat), 0);
  const returnBasePrice = returnFlight ? applyFareDiscount(returnFlight.basePriceCents) : 0;
  const numReturnSeats = selectedReturnSeats.length || 1;
  const returnTotalCents = returnFlight ? ((returnBasePrice * numReturnSeats) + returnSeatCost) : 0;

  // Joint Addons (applied once to checkout)
  const baggageCost = getBaggageCost(baggage);
  const mealCost = getMealCost(meal);
  const wifiCost = getWifiCost(wifi);
  const insuranceCost = getInsuranceCost(insurance);
  const addOnsTotalCents = baggageCost + mealCost + wifiCost + insuranceCost;

  const totalPriceCents = outboundTotalCents + returnTotalCents + addOnsTotalCents;
  const totalFormatted = (totalPriceCents / 100).toFixed(2);

  const numPassengers = returnFlight
    ? Math.max(selectedSeats.length, selectedReturnSeats.length)
    : selectedSeats.length;

  const handleBook = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (booking) return; // Guard lock: prevent duplicate execution on fast clicks

    // --- payment inputs validation at the very top ---
    if (selectedSeats.length === 0) {
      showToast("warning", "Please select at least one seat from the outbound flight seating map.");
      return;
    }

    if (returnFlight && selectedReturnSeats.length === 0) {
      showToast("warning", "Please select at least one seat from the return flight seating map.");
      return;
    }

    if (returnFlight && selectedSeats.length !== selectedReturnSeats.length) {
      showToast(
        "warning",
        `Please select the same number of seats for both flights. Currently selected: ${selectedSeats.length} outbound, ${selectedReturnSeats.length} return.`
      );
      return;
    }

    // Validate passenger names are filled
    for (let i = 0; i < numPassengers; i++) {
      if (!passengerNames[i] || !passengerNames[i].trim()) {
        showToast("warning", `Please enter the name for Passenger ${i + 1}`);
        return;
      }
    }

    const payload: any = { method: paymentMethod };
    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        showToast("warning", "Please enter your UPI ID");
        return;
      }
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId.trim())) {
        showToast("warning", "Please enter a valid UPI ID (e.g., name@bank)");
        return;
      }
      payload.upiId = upiId.trim();
    } else if (paymentMethod === 'CARD') {
      if (!cardName.trim()) {
        showToast("warning", "Please enter the cardholder's name");
        return;
      }
      const rawCard = cardNumber.replace(/\s+/g, "");
      if (!rawCard || rawCard.length < 13 || rawCard.length > 19 || !/^\d+$/.test(rawCard)) {
        showToast("warning", "Please enter a valid card number");
        return;
      }
      if (!cardExpiry.trim()) {
        showToast("warning", "Please enter the card expiry date (MM/YY)");
        return;
      }
      if (!cardCvv.trim() || cardCvv.trim().length < 3) {
        showToast("warning", "Please enter a valid CVV");
        return;
      }
      payload.cardNumber = rawCard;
      payload.cardBrand = 'CARD';
    }

    setBooking(true);
    let createdOutboundId = "";
    let createdReturnId = "";

    try {
      // Outbound names mapping
      const outboundNames = passengerNames.slice(0, selectedSeats.length).join(", ");
      // Return names mapping
      const returnNames = returnFlight
        ? passengerNames.slice(0, selectedReturnSeats.length).join(", ")
        : "";

      // 1. Create Outbound Booking
      const rOut = await api.post("/bookings", {
        flightId: flight.id,
        seatNumber: selectedSeats.join(", "),
        passengerNames: outboundNames,
        luggageOption: baggage,
        mealOption: meal,
        wifiOption: wifi,
        insuranceOption: insurance,
        totalPriceCents: outboundTotalCents + (returnFlight ? 0 : addOnsTotalCents) // bundle addons here if one-way
      });
      createdOutboundId = rOut.data.id;

      // 2. Create Return Booking (if roundtrip)
      if (returnFlight) {
        const rRet = await api.post("/bookings", {
          flightId: returnFlight.id,
          seatNumber: selectedReturnSeats.join(", "),
          passengerNames: returnNames,
          luggageOption: baggage,
          mealOption: meal,
          wifiOption: wifi,
          insuranceOption: insurance,
          totalPriceCents: returnTotalCents + addOnsTotalCents // bundle addons in return booking
        });
        createdReturnId = rRet.data.id;
      }

      // 3. Process Outbound Payment
      await api.post(`/bookings/${createdOutboundId}/pay`, payload);

      // 4. Process Return Payment
      if (createdReturnId) {
        await api.post(`/bookings/${createdReturnId}/pay`, payload);
      }

      showToast("success", returnFlight ? "Payment successful. Round-trip bookings confirmed!" : "Payment successful. Booking confirmed!");
      navigate("/bookings");
    } catch (err: any) {
      // Clean rollback of pending bookings to prevent orphaned records in case of payment failure
      if (createdOutboundId) {
        api.delete(`/bookings/${createdOutboundId}`).catch(() => {});
      }
      if (createdReturnId) {
        api.delete(`/bookings/${createdReturnId}`).catch(() => {});
      }
      showToast("error", err?.response?.data?.error || "Booking transaction failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // Generate seating grid: 6 rows, columns A, B, C, D, E, F
  const renderSeatMap = (selected: string[], type: 'outbound' | 'return', label: string) => {
    const rows = [1, 2, 3, 4, 5, 6];
    const cols = ["A", "B", "C", "D", "E", "F"];

    return (
      <div className="space-y-4 max-w-sm mx-auto p-3 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-255/40 dark:border-gray-700/60 shadow-inner">
        <div className="text-center font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
          {label}
        </div>
        <div className="text-center font-semibold text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Front of Aircraft
        </div>

        {/* Row loops */}
        {rows.map((row) => {
          const isBusiness = row <= 2;
          return (
            <div key={row} className="flex items-center justify-between">
              {/* Row label */}
              <div className="w-5 text-[10px] font-bold text-gray-450 dark:text-gray-500 text-center">
                {row}
              </div>

              {/* Seat Columns */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {cols.map((col, idx) => {
                  const seatId = `${row}${col}`;
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isSelected = selected.includes(seatId);

                  // Split seats with aisle between C and D
                  const aisleMargin = idx === 3 ? "ml-2.5 sm:ml-5" : "";

                  let seatStyle = "w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-[11px] border transition-all ";
                  if (isOccupied) {
                    seatStyle += "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed border-transparent";
                  } else if (isSelected) {
                    seatStyle += "bg-green-500 text-white border-green-600 shadow-md scale-105";
                  } else {
                    seatStyle += isBusiness
                      ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-200"
                      : "bg-white dark:bg-gray-850 text-gray-750 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-booking-lightblue";
                  }

                  return (
                    <button
                      key={col}
                      disabled={isOccupied}
                      onClick={() => handleSeatClick(seatId, type)}
                      className={`${seatStyle} ${aisleMargin}`}
                      title={`${seatId} - ${isBusiness ? 'Business (+₹5,000)' : 'Economy (+₹800)'}`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-around text-[10px] mt-4 pt-3 border-t border-gray-200 dark:border-gray-750 text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 rounded"></div>
            <span>Biz</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white dark:bg-gray-850 border border-gray-300 rounded"></div>
            <span>Eco</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-955">
        <Header />
        <div className="container py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-booking-lightblue"></div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-955">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-850 dark:text-gray-200 mb-4">Flight not found</h2>
          <button onClick={() => navigate("/")} className="btn-primary">Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-gray-100 font-sans">
      <Header />

      <div className="container py-8 max-w-6xl mx-auto px-4 animate-fade-in pb-16">
        <button
          onClick={() => navigate(-1)}
          className="text-booking-lightblue hover:text-booking-blue mb-6 flex items-center space-x-2 transition-colors font-bold text-sm"
        >
          <span>←</span>
          <span>Back to results</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Outbound Flight Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-750">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
                    {flight.airline.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-855 dark:text-white leading-tight">
                      Outbound • {flight.airline}
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Flight {flight.flightNumber}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-booking-lightblue/10 text-booking-lightblue rounded-full border border-booking-lightblue/20">
                  Outbound
                </span>
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-2 text-center sm:text-left">
                <div>
                  <div className="text-2xl font-bold text-gray-850 dark:text-white">{formatTime(flight.departure)}</div>
                  <div className="text-base font-bold text-booking-lightblue">{flight.origin}</div>
                  <div className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">{formatDateTime(flight.departure)}</div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-450 font-medium block">Duration: {getDuration(flight.departure, flight.arrival)}</span>
                  <div className="h-0.5 bg-gray-250 dark:bg-gray-700 my-1 relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm bg-white dark:bg-gray-900 px-1">✈️</span>
                  </div>
                  <span className="text-[10px] text-gray-450 uppercase tracking-widest font-extrabold">Non-stop</span>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl font-bold text-gray-855 dark:text-white">{formatTime(flight.arrival)}</div>
                  <div className="text-base font-bold text-booking-lightblue">{flight.destination}</div>
                  <div className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">{formatDateTime(flight.arrival)}</div>
                </div>
              </div>
            </div>

            {/* Return Flight Card (if round-trip) */}
            {returnFlight && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 p-6 shadow-soft animate-scale-in">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-750">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-booking-lightblue to-booking-blue rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
                      {returnFlight.airline.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-855 dark:text-white leading-tight">
                        Return • {returnFlight.airline}
                      </h2>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Flight {returnFlight.flightNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-booking-orange/10 text-booking-orange rounded-full border border-booking-orange/20">
                    Return
                  </span>
                </div>

                {/* Times */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-2 text-center sm:text-left">
                  <div>
                    <div className="text-2xl font-bold text-gray-855 dark:text-white">{formatTime(returnFlight.departure)}</div>
                    <div className="text-base font-bold text-booking-lightblue">{returnFlight.origin}</div>
                    <div className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">{formatDateTime(returnFlight.departure)}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-450 font-medium block">Duration: {getDuration(returnFlight.departure, returnFlight.arrival)}</span>
                    <div className="h-0.5 bg-gray-250 dark:bg-gray-700 my-1 relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm bg-white dark:bg-gray-900 px-1">✈️</span>
                    </div>
                    <span className="text-[10px] text-gray-450 uppercase tracking-widest font-extrabold">Non-stop</span>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-2xl font-bold text-gray-855 dark:text-white">{formatTime(returnFlight.arrival)}</div>
                    <div className="text-base font-bold text-booking-lightblue">{returnFlight.destination}</div>
                    <div className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">{formatDateTime(returnFlight.arrival)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Seating Pref Selector Grid */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft space-y-6">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white mb-1">
                  Select Seating Preferences
                </h2>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Row 1-2 designates Business Class (+₹5,000), other rows designate standard Economy Class (+₹800).
                </p>
              </div>

              <div className={`grid grid-cols-1 ${returnFlight ? "md:grid-cols-2" : "max-w-md mx-auto"} gap-6`}>
                {renderSeatMap(selectedSeats, 'outbound', `Outbound Seats (${flight.origin} ➔ ${flight.destination})`)}
                {returnFlight && renderSeatMap(selectedReturnSeats, 'return', `Return Seats (${returnFlight.origin} ➔ ${returnFlight.destination})`)}
              </div>
            </div>

            {/* Dynamic Passenger Registration Forms Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft space-y-6">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white mb-1">
                  Passenger Information
                </h2>
                <p className="text-xs text-gray-450 font-semibold leading-relaxed">
                  Enter the legal names of the passenger(s) exactly as shown on their Government ID.
                </p>
              </div>

              {numPassengers === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-450 font-medium">
                  Please select outbound/return seats above to enter passenger details.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: numPassengers }).map((_, idx) => {
                    const outboundSeat = selectedSeats[idx] || "—";
                    const returnSeat = selectedReturnSeats[idx] || "—";
                    return (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-850/30 p-4 rounded-2xl border border-gray-200/40 dark:border-gray-800 space-y-2">
                        <label className="block text-[10px] font-extrabold text-booking-lightblue uppercase tracking-wider">
                          Passenger {idx + 1} {` (Seat: Outbound ${outboundSeat}${returnFlight ? ` / Return ${returnSeat}` : ""})`}
                        </label>
                        <input
                          type="text"
                          placeholder="Full Name (e.g. Lokesh Parasuraman)"
                          value={passengerNames[idx] || ""}
                          onChange={(e) => {
                            const next = [...passengerNames];
                            next[idx] = e.target.value;
                            setPassengerNames(next);
                          }}
                          className="input-field text-xs py-2.5"
                          required
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* In-flight comfort addons */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft space-y-6">
              <h2 className="text-lg md:text-xl font-extrabold text-gray-855 dark:text-white">
                Comfort Add-ons
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    <BaggageIcon size={12} />
                    <span>Baggage Allowance</span>
                  </label>
                  <select
                    value={baggage}
                    onChange={(e) => setBaggage(e.target.value)}
                    className="input-field py-2.5 text-xs font-semibold"
                  >
                    <option value="15kg (Included)">15kg checked-in baggage (Included)</option>
                    <option value="25kg (+₹1,500)">25kg checked-in baggage (+₹1,500.00)</option>
                    <option value="35kg (+₹3,000)">35kg checked-in baggage (+₹3,000.00)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    <MealIcon size={12} />
                    <span>Hot Meal Selection</span>
                  </label>
                  <select
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="input-field py-2.5 text-xs font-semibold"
                  >
                    <option value="None">No Meal (Included)</option>
                    <option value="Vegetarian Standard">Standard Vegetarian Meal (+₹450.00)</option>
                    <option value="Non-Vegetarian Standard">Standard Non-Veg Meal (+₹600.00)</option>
                    <option value="Vegan Choice">Vegan Option (+₹500.00)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    <WifiIcon size={12} />
                    <span>In-Flight Wi-Fi</span>
                  </label>
                  <select
                    value={wifi}
                    onChange={(e) => setWifi(e.target.value)}
                    className="input-field py-2.5 text-xs font-semibold"
                  >
                    <option value="None">No Wi-Fi Connect (Offline)</option>
                    <option value="Messaging Only">Messaging Apps Only (+₹300.00)</option>
                    <option value="Premium High Speed">Full Internet & Streaming (+₹1,000.00)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    <ShieldIcon size={12} />
                    <span>Travel Insurance</span>
                  </label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="input-field py-2.5 text-xs font-semibold"
                  >
                    <option value="None">Declined (No coverage)</option>
                    <option value="Basic Shield">Basic medical & flight delay shield (+₹499.00)</option>
                    <option value="Premium Cover">Premium comprehensive shield (+₹999.00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 sticky top-24 space-y-6 shadow-soft">
              <h2 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white">
                Detailed Pricing
              </h2>

              <div className="space-y-3.5 text-xs text-gray-500 font-semibold">
                
                {/* Fare concession badge */}
                {fareInfo.discountPct > 0 && (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200/60 dark:border-green-800/40 rounded-xl px-3 py-2 mb-1">
                    <span className="text-base">{fareInfo.icon}</span>
                    <div>
                      <div className="text-[10px] font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wide">{fareInfo.label}</div>
                      <div className="text-[9px] font-bold text-green-600 dark:text-green-500">Concession applied to base fare</div>
                    </div>
                  </div>
                )}

                {/* Outbound Details */}
                <div className="flex justify-between items-center text-gray-650 dark:text-gray-300">
                  <span>Outbound Fare {selectedSeats.length > 1 ? `(x${selectedSeats.length})` : ""}</span>
                  <div className="text-right">
                    {fareInfo.discountPct > 0 && (
                      <div className="text-[10px] text-gray-400 line-through">
                        ₹{((flight.basePriceCents * numOutboundSeats) / 100).toFixed(2)}
                      </div>
                    )}
                    <span>₹{((outboundBasePrice * numOutboundSeats) / 100).toFixed(2)}</span>
                    {fareInfo.discountPct > 0 && (
                      <div className="text-[9px] text-green-500 font-extrabold">-{fareInfo.discountPct}% off</div>
                    )}
                  </div>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-gray-450 font-medium pl-2.5">
                    <span>Seat selection ({selectedSeats.join(", ")})</span>
                    <span>₹{(seatCost / 100).toFixed(2)}</span>
                  </div>
                )}

                {/* Return Details */}
                {returnFlight && (
                  <>
                    <div className="flex justify-between items-center text-gray-650 dark:text-gray-300 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                      <span>Return Fare {selectedReturnSeats.length > 1 ? `(x${selectedReturnSeats.length})` : ""}</span>
                      <div className="text-right">
                        {fareInfo.discountPct > 0 && (
                          <div className="text-[10px] text-gray-400 line-through">
                            ₹{((returnFlight.basePriceCents * numReturnSeats) / 100).toFixed(2)}
                          </div>
                        )}
                        <span>₹{((returnBasePrice * numReturnSeats) / 100).toFixed(2)}</span>
                        {fareInfo.discountPct > 0 && (
                          <div className="text-[9px] text-green-500 font-extrabold">-{fareInfo.discountPct}% off</div>
                        )}
                      </div>
                    </div>
                    {selectedReturnSeats.length > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-gray-455 font-medium pl-2.5">
                        <span>Seat selection ({selectedReturnSeats.join(", ")})</span>
                        <span>₹{(returnSeatCost / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Joint Addons */}
                {addOnsTotalCents > 0 && (
                  <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Selected Add-ons</span>
                    {baggageCost > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-gray-450 pl-2">
                        <span>Checked Baggage Allowance</span>
                        <span>₹{(baggageCost / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {mealCost > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-gray-455 pl-2">
                        <span>In-flight Hot Meal</span>
                        <span>₹{(mealCost / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {wifiCost > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-gray-455 pl-2">
                        <span>High-Speed Wi-Fi Bundle</span>
                        <span>₹{(wifiCost / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {insuranceCost > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-gray-455 pl-2">
                        <span>Travel Safety Insurance</span>
                        <span>₹{(insuranceCost / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Grand Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-gray-800 dark:text-white uppercase">Grand Total</span>
                    <span className="text-2xl font-extrabold text-booking-lightblue tracking-tight font-display">₹{totalFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Payment selection */}
              <div className="border-t border-gray-150 dark:border-gray-750 pt-4 space-y-4">
                <div className="font-bold text-xs uppercase tracking-wider text-gray-450">Payment Method</div>

                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-full border transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-booking-lightblue text-white border-booking-lightblue shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    UPI
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-full border transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-booking-lightblue text-white border-booking-lightblue shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    CARD
                  </button>
                </div>

                {paymentMethod === 'UPI' ? (
                  <div className="space-y-3 animate-fade-in">
                    <input
                      type="text"
                      placeholder="UPI ID (e.g. name@bank)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input-field text-xs py-2.5"
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input-field text-xs py-2.5"
                    />
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field text-xs py-2.5"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
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

              {/* Checkout Button */}
              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full btn-primary text-sm py-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  "CONFIRM AND BOOK SEATS ➔"
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center font-semibold">
                🔒 Instant secure banking via FlyFast Gateway
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
