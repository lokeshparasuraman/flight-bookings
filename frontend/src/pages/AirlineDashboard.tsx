import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import { FlightIcon, TicketIcon, RevenueIcon } from "../components/Icons";
import Footer from "../components/Footer";

export default function AirlineDashboard() {
  const [flights, setFlights] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"flights" | "bookings">("flights");

  // Add flight state
  const [flightNumber, setFlightNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [basePriceRupees, setBasePriceRupees] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();
  const airlineName = localStorage.getItem("airlineName") || "Airline Partner";

  // Category parsing
  const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
  const partnerCategory = categoryMatch ? categoryMatch[1] : "Airline";
  const partnerCleanName = categoryMatch ? categoryMatch[2] : airlineName;

  const getLabels = (category: string) => {
    switch (category) {
      case "Hotel":
        return {
          consoleTitle: "Hotel Console",
          metricTitle: "Active Rooms",
          formTitle: "Register New Hotel Room",
          formSubtitle: "Publish room listings directly to users",
          field1: "Room Identifier (e.g. Deluxe-102)",
          field2: "Location / City (e.g. DEL)",
          field3: "Amenities Summary (e.g. WiFi, AC)",
          field4: "Check-in Availability Start",
          field5: "Check-out Availability End",
          field6: "Price per Night (₹)",
          submitBtn: "REGISTER HOTEL ROOM ➔",
          listHeader: "Rooms List",
          listCol1: "Room ID",
          listCol2: "Location",
          listCol3: "Amenities",
          bookingsHeader: "Room Bookings"
        };
      case "Bus":
        return {
          consoleTitle: "Bus Console",
          metricTitle: "Active Routes",
          formTitle: "Register New Bus Route",
          formSubtitle: "Publish route schedules directly to users",
          field1: "Bus / Plate Number (e.g. KA-01-F-1234)",
          field2: "Origin Station (e.g. BLR)",
          field3: "Destination Station (e.g. MYS)",
          field4: "Departure Time",
          field5: "Arrival Time",
          field6: "Ticket Fare (₹)",
          submitBtn: "REGISTER BUS ROUTE ➔",
          listHeader: "Routes List",
          listCol1: "Bus ID",
          listCol2: "From",
          listCol3: "To",
          bookingsHeader: "Bus Bookings"
        };
      case "Cruise":
        return {
          consoleTitle: "Cruise Console",
          metricTitle: "Active Voyages",
          formTitle: "Register New Voyage",
          formSubtitle: "Publish voyages directly to users",
          field1: "Vessel Name / ID (e.g. Ocean Queen)",
          field2: "Departure Port (e.g. BOM)",
          field3: "Arrival Port (e.g. GOI)",
          field4: "Sailing Time",
          field5: "Arrival Time",
          field6: "Cabin Fare (₹)",
          submitBtn: "REGISTER CRUISE VOYAGE ➔",
          listHeader: "Voyages List",
          listCol1: "Vessel ID",
          listCol2: "Port Out",
          listCol3: "Port In",
          bookingsHeader: "Voyage Bookings"
        };
      case "Cab":
        return {
          consoleTitle: "Cab Console",
          metricTitle: "Active Fleet Cabs",
          formTitle: "Register New Fleet Cab",
          formSubtitle: "Publish cabs details directly to users",
          field1: "Vehicle Model / Plate (e.g. Innova Crysta)",
          field2: "Service Area (e.g. BOM)",
          field3: "Drop Zone / Limit (e.g. Pune)",
          field4: "Service Start Time",
          field5: "Service End Time",
          field6: "Base Fare (₹)",
          submitBtn: "REGISTER CAB SERVICE ➔",
          listHeader: "Cab Fleet",
          listCol1: "Cab Model",
          listCol2: "Service Area",
          listCol3: "Drop Zone",
          bookingsHeader: "Cab Bookings"
        };
      default:
        return {
          consoleTitle: "Airline Console",
          metricTitle: "Active Routes",
          formTitle: "Register New Flight",
          formSubtitle: "Publish route schedules directly to users",
          field1: "Flight Number (e.g. AI-102)",
          field2: "Origin Code (e.g. DEL)",
          field3: "Destination Code (e.g. BOM)",
          field4: "Departure Time",
          field5: "Arrival Time",
          field6: "Base Ticket Price (₹)",
          submitBtn: "REGISTER FLIGHT ➔",
          listHeader: "Flights List",
          listCol1: "Flight No.",
          listCol2: "From",
          listCol3: "To",
          bookingsHeader: "Passenger Bookings"
        };
    }
  };

  const labels = getLabels(partnerCategory);

  const loadDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/airline/login");
      return;
    }
    setAuthToken(token);

    try {
      const flightsRes = await api.get("/airline/flights");
      setFlights(flightsRes.data);

      const bookingsRes = await api.get("/airline/bookings");
      setBookings(bookingsRes.data);
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Failed to load dashboard metrics");
      if (err?.status === 401 || err?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("airlineName");
        navigate("/airline/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim() || !origin.trim() || !destination.trim() || !departure || !arrival || !basePriceRupees) {
      showToast("warning", "Please fill in all registration parameters");
      return;
    }

    if (partnerCategory === "Airline" && origin.trim().toUpperCase() === destination.trim().toUpperCase()) {
      showToast("warning", "Origin and destination airports cannot be identical");
      return;
    }

    const priceCents = Math.round(parseFloat(basePriceRupees) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      showToast("warning", "Please enter a valid price");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/airline/flights", {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        flightNumber: flightNumber.toUpperCase(),
        departure: new Date(departure).toISOString(),
        arrival: new Date(arrival).toISOString(),
        basePriceCents: priceCents
      });

      showToast("success", `${partnerCategory} listing ${flightNumber.toUpperCase()} registered successfully!`);
      // Reset form
      setFlightNumber("");
      setOrigin("");
      setDestination("");
      setDeparture("");
      setArrival("");
      setBasePriceRupees("");

      // Reload
      loadDashboardData();
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Failed to register listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("airlineName");
    showToast("success", "Logged out of corporate console");
    navigate("/");
  };

  // Calculate totals
  const totalFlights = flights.length;
  const totalBookings = bookings.length;
  const totalRevenueCents = bookings
    .filter(b => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.priceCents, 0);
  const totalRevenueRupees = (totalRevenueCents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <Header />

      {/* Corporate Dashboard Header Banner */}
      <div className="bg-[#051429] text-white pt-8 pb-24 px-4 border-b border-gray-800">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest bg-booking-lightblue/20 text-booking-lightblue py-1 px-3.5 rounded-full inline-block mb-2 border border-booking-lightblue/30">
              {labels.consoleTitle}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              {partnerCleanName}
              <span className="text-xs bg-booking-lightblue/20 text-booking-lightblue py-1 px-2.5 font-normal rounded-full border border-booking-lightblue/30">
                {partnerCategory}
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-semibold">Manage registered {labels.metricTitle.toLowerCase()}, schedules, fares, and view bookings.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-red-650/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 font-bold rounded-full text-xs transition-all uppercase tracking-wider"
          >
            Exit Corporate Console
          </button>
        </div>
      </div>

      {/* Main Container Dashboard */}
      <div className="container max-w-6xl mx-auto -mt-12 px-4 pb-20 relative z-10">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Flights */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft flex items-center gap-4">
            <span className="p-3 bg-booking-lightblue/10 rounded-2xl">
              <FlightIcon className="w-8 h-8 text-booking-lightblue transform -rotate-45" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{labels.metricTitle}</span>
              <span className="text-2xl font-extrabold text-gray-855 dark:text-white font-display mt-0.5 block">{totalFlights}</span>
            </div>
          </div>
          {/* Card 2: Bookings */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft flex items-center gap-4">
            <span className="p-3 bg-green-50 dark:bg-green-950/20 rounded-2xl">
              <TicketIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{labels.bookingsHeader}</span>
              <span className="text-2xl font-extrabold text-gray-855 dark:text-white font-display mt-0.5 block">{totalBookings}</span>
            </div>
          </div>
          {/* Card 3: Revenue */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft flex items-center gap-4">
            <span className="p-3 bg-amber-50 dark:bg-amber-955/10 rounded-2xl">
              <RevenueIcon className="w-8 h-8 text-amber-500" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Earned Fares</span>
              <span className="text-2xl font-extrabold text-gray-855 dark:text-white font-display mt-0.5 block">₹{totalRevenueRupees}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Form Section: Add Flight */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-soft space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-gray-850 dark:text-white">
                  {labels.formTitle}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{labels.formSubtitle}</p>
              </div>

              <form onSubmit={handleAddFlight} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {labels.field1}
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder={labels.field1}
                    className="input-field text-xs py-2.5"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {labels.field2}
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder={labels.field2}
                      maxLength={partnerCategory === "Airline" ? 3 : 100}
                      className={`input-field text-xs py-2.5 ${partnerCategory === "Airline" ? "uppercase text-center" : ""}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {labels.field3}
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder={labels.field3}
                      maxLength={partnerCategory === "Airline" ? 3 : 100}
                      className={`input-field text-xs py-2.5 ${partnerCategory === "Airline" ? "uppercase text-center" : ""}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {labels.field4}
                  </label>
                  <input
                    type="datetime-local"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="input-field text-xs py-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {labels.field5}
                  </label>
                  <input
                    type="datetime-local"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className="input-field text-xs py-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {labels.field6}
                  </label>
                  <input
                    type="number"
                    value={basePriceRupees}
                    onChange={(e) => setBasePriceRupees(e.target.value)}
                    placeholder="E.g., 4500"
                    min={1}
                    className="input-field text-xs py-2.5"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary text-xs py-3.5 mt-2 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    labels.submitBtn
                  )}
                </button>
              </form>
            </div>

            {/* List Section: Tabbed Panel */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl shadow-soft overflow-hidden">
                         {/* Tab Selector */}
              <div className="bg-gray-50 dark:bg-gray-850 border-b border-gray-150 dark:border-gray-800 flex">
                <button
                  onClick={() => setActiveTab("flights")}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === "flights"
                      ? "border-booking-lightblue text-booking-lightblue bg-white dark:bg-gray-900"
                      : "border-transparent text-gray-400 hover:text-gray-650"
                  }`}
                >
                  <FlightIcon className="w-4 h-4 transform -rotate-45" />
                  <span>{labels.listHeader} ({totalFlights})</span>
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === "bookings"
                      ? "border-booking-lightblue text-booking-lightblue bg-white dark:bg-gray-900"
                      : "border-transparent text-gray-400 hover:text-gray-650"
                  }`}
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>{labels.bookingsHeader} ({totalBookings})</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                
                {/* 1. Flights List */}
                {activeTab === "flights" && (
                  <div className="overflow-x-auto">
                    {flights.length === 0 ? (
                      <div className="text-center py-12 text-gray-450 text-xs font-medium">
                        No {labels.metricTitle.toLowerCase()} registered yet. Use the panel on the left to add one!
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-2">{labels.listCol1}</th>
                            <th className="pb-3 pr-2">{labels.listCol2} ➔ {labels.listCol3}</th>
                            <th className="pb-3 pr-2">Schedule Time</th>
                            <th className="pb-3 text-right">Base Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {flights.map((f) => (
                            <tr key={f.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                              <td className="py-3.5 font-extrabold text-booking-lightblue">{f.flightNumber}</td>
                              <td className="py-3.5 font-bold">{f.origin} ➔ {f.destination}</td>
                              <td className="py-3.5 text-gray-555">
                                <span className="block font-semibold">{formatDate(f.departure)}</span>
                                <span className="text-[10px] text-gray-400">Duration: {getDuration(f.departure, f.arrival)}</span>
                              </td>
                              <td className="py-3.5 text-right font-extrabold text-gray-800 dark:text-white">
                                ₹{(f.basePriceCents / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 2. Bookings Log */}
                {activeTab === "bookings" && (
                  <div className="overflow-x-auto">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12 text-gray-450 text-xs font-medium">
                        No reservations recorded for your {labels.metricTitle.toLowerCase()} yet.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-2">Passenger</th>
                            <th className="pb-3 pr-2">Entity ID</th>
                            <th className="pb-3 pr-2">Seat Details</th>
                            <th className="pb-3 pr-2">Status</th>
                            <th className="pb-3 text-right">Price Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((b) => (
                            <tr key={b.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                              <td className="py-3.5">
                                <span className="block font-bold text-gray-800 dark:text-white">{b.user?.name || "Passenger"}</span>
                                <span className="text-[10px] text-gray-400 leading-none">{b.user?.email}</span>
                              </td>
                              <td className="py-3.5">
                                <span className="block font-extrabold text-booking-lightblue">{b.flight?.flightNumber}</span>
                                <span className="text-[10px] text-gray-450">{b.flight?.origin} ➔ {b.flight?.destination}</span>
                              </td>
                              <td className="py-3.5 font-semibold">
                                <span className="block">Seat: <span className="font-extrabold text-booking-lightblue">{b.seatNumber || "Any"}</span></span>
                                <span className="text-[10px] text-gray-400 font-normal leading-none">Meals: {b.mealOption || "None"}</span>
                              </td>
                              <td className="py-3.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                                  b.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                    : b.status === "CANCELLED"
                                      ? "bg-red-50 text-red-650 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
                                      : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right font-extrabold text-gray-800 dark:text-white">
                                ₹{(b.priceCents / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
