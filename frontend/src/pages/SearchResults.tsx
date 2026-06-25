/**
 * SearchResults.tsx — Flight Search Results Page
 *
 * This page is navigated to from Home with query params like:
 *   /search?origin=DEL&destination=BOM&date=2025-06-28&tripType=oneway
 *   /search?origin=DEL&destination=BOM&date=2025-06-28&tripType=roundtrip&returnDate=2025-07-01
 *
 * DATA FLOW:
 * On mount, we fetch outbound flights and (if round trip) return flights in parallel.
 * Flights are then run through processFlights() which applies client-side filters
 * and sorting before rendering. This keeps filtering instant with no server round trips.
 *
 * ROUND TRIP MODE:
 * When tripType=roundtrip, we show two columns side by side (stacks on mobile).
 * The user selects one outbound flight and one return flight.
 * A sticky bottom bar shows the combined total and a "Book Round Trip" CTA.
 * Clicking it navigates to /flight/:outboundId?returnFlightId=:returnId
 *
 * FILTERS:
 * - Sort by: cheapest / most expensive / earliest departure / shortest flight
 * - Airline: filter to specific airline(s) — toggleable pill buttons
 * - Time slot: morning (6-12), afternoon (12-18), evening (18-6)
 * All filters are client-side and update instantly.
 *
 * AI CHAT:
 * After results load, an embedded AI chat panel appears at the bottom.
 * Users can ask natural language questions like "which flight has extra legroom"
 * or "is IndiGo or Air India better for this route".
 */

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import FlightCard from "../components/FlightCard";
import Header from "../components/Header";
import EnhancedAiChat from "../components/EnhancedAiChat";
import { FlightIcon } from "../components/Icons";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";

// Simple helper to read query params from the URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const { t } = useLanguage();
  const q = useQuery();
  const navigate = useNavigate();

  // Pull search parameters straight from the URL
  const origin = q.get("origin") || "DEL";
  const destination = q.get("destination") || "BOM";
  const date = q.get("date") || "";
  const tripType = q.get("tripType") || "oneway";
  const returnDate = q.get("returnDate") || "";
  const specialFare = q.get("specialFare") || "regular";

  /**
   * SPECIAL_FARE_DISCOUNTS — mirrors the same data defined in Home.tsx.
   * We define it here too (rather than sharing a module) to keep this page
   * self-contained and avoid a circular dependency.
   * discountPct: % reduction applied to basePriceCents for display.
   */
  const SPECIAL_FARE_DISCOUNTS: Record<string, { discountPct: number; label: string; icon: string; color: string }> = {
    regular:  { discountPct: 0,  label: "Regular Fare",       icon: "✈️",  color: "gray" },
    student:  { discountPct: 10, label: "Student Fare",        icon: "🎓", color: "blue" },
    armed:    { discountPct: 50, label: "Armed Forces Fare",   icon: "🎖️", color: "amber" },
    senior:   { discountPct: 10, label: "Senior Citizen Fare", icon: "🧓", color: "purple" },
    gst:      { discountPct: 5,  label: "GST Business Fare",   icon: "🏢", color: "green" },
  };

  const fareInfo = SPECIAL_FARE_DISCOUNTS[specialFare] ?? SPECIAL_FARE_DISCOUNTS["regular"];

  /** Apply special fare discount to a basePriceCents value */
  const applyFareDiscount = (cents: number): number =>
    Math.round(cents * (1 - fareInfo.discountPct / 100));

  // outboundFlights: DEL → BOM flights on the departure date
  // returnFlights: BOM → DEL flights on the return date (round trip only)
  const [outboundFlights, setOutboundFlights] = useState<any[]>([]);
  const [returnFlights, setReturnFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & sort state — all filtering happens client-side for speed
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("cheapest");

  // Round-trip: tracks which outbound and return flights the user has selected
  const [selectedOutbound, setSelectedOutbound] = useState<any | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch both directions in parallel using Promise.all
    // If it's a one-way trip, fetchReturn resolves immediately
    const fetchOutbound = api.get("/flights/search", { params: { origin, destination, date } })
      .then((r) => setOutboundFlights(r.data))
      .catch(() => setOutboundFlights([]));

    const fetchReturn = (tripType === "roundtrip" && returnDate)
      ? api.get("/flights/search", { params: { origin: destination, destination: origin, date: returnDate } })
          .then((r) => setReturnFlights(r.data))
          .catch(() => setReturnFlights([]))
      : Promise.resolve();

    Promise.all([fetchOutbound, fetchReturn])
      .finally(() => setLoading(false));
  }, [origin, destination, date, tripType, returnDate]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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

  const getAirlineColor = (airline: string) => {
    switch (airline.toLowerCase()) {
      case 'indigo':
        return 'from-blue-600 to-blue-800';
      case 'air india':
      case 'air india express':
        return 'from-red-500 to-orange-600';
      case 'vistara':
        return 'from-indigo-900 via-purple-950 to-purple-800';
      case 'spicejet':
        return 'from-orange-500 to-red-500';
      case 'akasa air':
        return 'from-orange-400 to-amber-500';
      default:
        return 'from-zinc-600 to-zinc-800';
    }
  };

  // Extract unique airlines dynamically for filter options
  const allAirlines = Array.from(new Set([
    ...outboundFlights.map(f => f.airline),
    ...returnFlights.map(f => f.airline)
  ]));

  /**
   * processFlights — Client-side filter + sort pipeline
   *
   * 1. Remove flights that have already departed (past departure time)
   * 2. Filter by selected airlines (if any airline filters are active)
   * 3. Filter by time slot (morning/afternoon/evening)
   * 4. Sort by the selected sort option
   *
   * This runs synchronously on every render — fast because flight lists
   * are typically small (< 100 items for a single route/date).
   */
  const processFlights = (flightsList: any[]) => {
    // Step 1: Remove already-departed flights
    let result = flightsList.filter((f) => new Date(f.departure).getTime() > Date.now());

    // Step 2: Filter by Airline Brand
    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airline));
    }

    // Step 3: Filter by Departure Time Windows
    if (selectedTimes.length > 0) {
      result = result.filter(f => {
        const hour = new Date(f.departure).getHours();
        if (selectedTimes.includes("morning") && hour >= 6 && hour < 12) return true;
        if (selectedTimes.includes("afternoon") && hour >= 12 && hour < 18) return true;
        if (selectedTimes.includes("evening") && (hour >= 18 || hour < 6)) return true;
        return false;
      });
    }

    // Step 4: Sort Flights
    return [...result].sort((a, b) => {
      if (sortBy === "cheapest") return a.basePriceCents - b.basePriceCents;
      if (sortBy === "expensive") return b.basePriceCents - a.basePriceCents;
      if (sortBy === "earliest") return new Date(a.departure).getTime() - new Date(b.departure).getTime();
      if (sortBy === "duration") {
        const durA = new Date(a.arrival).getTime() - new Date(a.departure).getTime();
        const durB = new Date(b.arrival).getTime() - new Date(b.departure).getTime();
        return durA - durB;
      }
      return 0;
    });
  };

  const processedOutbound = processFlights(outboundFlights);
  const processedReturn = processFlights(returnFlights);

  const handleBookRoundtrip = () => {
    if (!selectedOutbound || !selectedReturn) return;
    // Pass the specialFare through so FlightDetail can apply the same discount
    navigate(`/flight/${selectedOutbound.id}?returnFlightId=${selectedReturn.id}&specialFare=${specialFare}`);
  };

  const isRoundTrip = tripType === "roundtrip" && returnDate;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-gray-100 font-sans pb-28">
      {/* Background Animations */}
      <div className="bg-blobs">
        <div className="grid-pattern" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="container py-8 max-w-7xl mx-auto px-4">
          
          {/* Back Header navigation */}
          <div className="mb-6 animate-fade-in">
            <button
              onClick={() => navigate("/")}
              className="text-booking-lightblue hover:text-booking-blue flex items-center space-x-2 transition-all font-bold text-sm"
            >
              <span>←</span>
              <span>{t("modify_search")}</span>
            </button>
          </div>

          {/* Search Summary Header Bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-6 mb-6 flex flex-col gap-3 shadow-soft">
            {/* Top row: route info + flights count pill */}
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
                  <span>🛫</span>
                  <span>{origin}</span>
                  <span className="text-booking-lightblue">⇌</span>
                  <span>{destination}</span>
                  <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-booking-lightblue/10 text-booking-lightblue rounded-full border border-booking-lightblue/20">
                    {isRoundTrip ? t("round_trip") : t("one_way")}
                  </span>
                </h1>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-4">
                  <span>{t("departure")}: {formatDate(date)}</span>
                  {isRoundTrip && <span>{t("return")}: {formatDate(returnDate)}</span>}
                </p>
              </div>

              <div className="text-xs font-bold text-green-600 dark:text-green-400 px-3.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {isRoundTrip 
                  ? `${processedOutbound.length} / ${processedReturn.length} ${t("outbound_return_available")}`
                  : `${processedOutbound.length} ${t("flights_list")}`
                }
              </div>
            </div>

            {/* Special Fare Badge — only shows when a concession fare is active */}
            {specialFare !== "regular" && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-300/50 dark:border-green-800/40 rounded-xl px-3.5 py-2 shadow-sm animate-fade-in self-start">
                <span className="text-base shrink-0">{fareInfo.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wide truncate">{fareInfo.label}</div>
                  <div className="text-[11px] font-bold text-green-600 dark:text-green-500">-{fareInfo.discountPct}% off all base fares</div>
                </div>
              </div>
            )}
          </div>

          {/* SDE-2 High-Complexity Filter & Sorting Console */}
          {!loading && (outboundFlights.length > 0 || returnFlights.length > 0) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-6 shadow-soft animate-scale-in">
              {/* 1. Sort controls */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("sort_by")}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field py-1.5 px-3 text-xs w-auto font-bold bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-full"
                >
                  <option value="cheapest">{t("cheapest_ticket")}</option>
                  <option value="expensive">{t("highest_price")}</option>
                  <option value="earliest">{t("earliest_departure")}</option>
                  <option value="duration">{t("shortest_flight")}</option>
                </select>
              </div>

              {/* 2. Airline selection */}
              {allAirlines.length > 0 && (
                <div className="flex items-center flex-wrap gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("airlines")}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {allAirlines.map(airline => {
                      const isActive = selectedAirlines.includes(airline);
                      return (
                        <button
                          key={airline}
                          onClick={() => {
                            if (isActive) setSelectedAirlines(prev => prev.filter(a => a !== airline));
                            else setSelectedAirlines(prev => [...prev, airline]);
                          }}
                          className={`py-1 px-3.5 rounded-full border text-[11px] font-bold transition-all ${
                            isActive 
                              ? "bg-booking-lightblue text-white border-booking-lightblue shadow-sm"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-booking-lightblue"
                          }`}
                        >
                          {airline}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Time Slot filter */}
              <div className="flex items-center flex-wrap gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("schedules")}</span>
                <div className="flex gap-1.5">
                  {["morning", "afternoon", "evening"].map(slot => {
                    const isActive = selectedTimes.includes(slot);
                    const labels: Record<string, string> = { morning: t("morning"), afternoon: t("afternoon"), evening: t("evening") };
                    return (
                      <button
                        key={slot}
                        onClick={() => {
                          if (isActive) setSelectedTimes(prev => prev.filter(s => s !== slot));
                          else setSelectedTimes(prev => [...prev, slot]);
                        }}
                        className={`py-1 px-3.5 rounded-full border text-[11px] font-bold transition-all capitalize ${
                          isActive 
                            ? "bg-booking-lightblue text-white border-booking-lightblue shadow-sm"
                            : "bg-white dark:bg-gray-800 text-gray-650 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-booking-lightblue"
                        }`}
                      >
                        {labels[slot]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-booking-lightblue"></div>
            </div>
          )}

          {/* Outbound & Return Flights Side-by-Side (Round-trip) */}
          {!loading && isRoundTrip && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Outbound Flight Selection Column */}
              <div className="space-y-4">
                <div className="bg-[#0c2443] text-white py-3 px-5 rounded-2xl shadow-md flex items-center justify-between">
                  <h2 className="font-extrabold text-xs uppercase tracking-widest">
                    {t("departure")} • {origin} ➔ {destination}
                  </h2>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                    {processedOutbound.length} {t("options_count")}
                  </span>
                </div>
                 {processedOutbound.length === 0 ? (
                  <div className="bg-white dark:bg-gray-905 p-12 text-center rounded-2xl border border-gray-205 dark:border-gray-800 animate-scale-in">
                    <div className="flex justify-center mb-3">
                      <FlightIcon className="w-10 h-10 text-gray-300 dark:text-gray-650 transform -rotate-45" />
                    </div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-350">{t("no_departure_flights")}</h3>
                    <p className="text-xs text-gray-505 mt-1">{t("try_modifying_filters")}</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                    {processedOutbound.map((f) => {
                      const isSelected = selectedOutbound?.id === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedOutbound(f)}
                          className={`bg-white dark:bg-gray-900 p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm relative group hover:shadow-md ${
                            isSelected 
                              ? "border-booking-lightblue ring-2 ring-booking-lightblue/35"
                              : "border-gray-205 dark:border-gray-800 hover:border-booking-lightblue/30"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 bg-gradient-to-br ${getAirlineColor(f.airline)} rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm`}>
                                {f.airline.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-gray-800 dark:text-white leading-tight">{f.airline}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{f.flightNumber}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-405 font-medium block">{t("starting_fare")}</span>
                              {fareInfo.discountPct > 0 && (
                                <span className="text-[10px] text-gray-400 line-through block">
                                  ₹{(f.basePriceCents / 100).toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="text-lg font-extrabold text-booking-lightblue">
                                ₹{(applyFareDiscount(f.basePriceCents) / 100).toLocaleString('en-IN')}
                              </span>
                              {fareInfo.discountPct > 0 && (
                                <span className="text-[9px] font-extrabold text-green-500 block">-{fareInfo.discountPct}% applied</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 items-center px-1 text-xs text-center border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
                            <div className="text-left">
                              <span className="font-extrabold text-gray-855 dark:text-white">{formatTime(f.departure)}</span>
                              <span className="block text-[10px] text-gray-400">{f.origin}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-450 block leading-tight">{getDuration(f.departure, f.arrival)}</span>
                              <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-full my-0.5 relative">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-1.5 flex items-center justify-center">
                                  <FlightIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transform -rotate-45" />
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-gray-855 dark:text-white">{formatTime(f.arrival)}</span>
                              <span className="block text-[10px] text-gray-400">{f.destination}</span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 bg-booking-lightblue text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md animate-scale-in">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Return Flight Selection Column */}
              <div className="space-y-4">
                <div className="bg-[#0c2443] text-white py-3 px-5 rounded-2xl shadow-md flex items-center justify-between">
                  <h2 className="font-extrabold text-xs uppercase tracking-widest">
                    {t("return")} • {destination} ➔ {origin}
                  </h2>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                    {processedReturn.length} {t("options_count")}
                  </span>
                </div>

                {processedReturn.length === 0 ? (
                  <div className="bg-white dark:bg-gray-905 p-12 text-center rounded-2xl border border-gray-205 dark:border-gray-800 animate-scale-in">
                    <div className="flex justify-center mb-3">
                      <FlightIcon className="w-10 h-10 text-gray-300 dark:text-gray-655 transform -rotate-45" />
                    </div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-350">{t("no_return_flights")}</h3>
                    <p className="text-xs text-gray-505 mt-1">{t("try_modifying_filters")}</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                    {processedReturn.map((f) => {
                      const isSelected = selectedReturn?.id === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedReturn(f)}
                          className={`bg-white dark:bg-gray-900 p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm relative group hover:shadow-md ${
                            isSelected 
                              ? "border-booking-lightblue ring-2 ring-booking-lightblue/35"
                              : "border-gray-205 dark:border-gray-800 hover:border-booking-lightblue/30"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 bg-gradient-to-br ${getAirlineColor(f.airline)} rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm`}>
                                {f.airline.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-gray-800 dark:text-white leading-tight">{f.airline}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{f.flightNumber}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-405 font-medium block">{t("starting_fare")}</span>
                              {fareInfo.discountPct > 0 && (
                                <span className="text-[10px] text-gray-400 line-through block">
                                  ₹{(f.basePriceCents / 100).toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="text-lg font-extrabold text-booking-lightblue">
                                ₹{(applyFareDiscount(f.basePriceCents) / 100).toLocaleString('en-IN')}
                              </span>
                              {fareInfo.discountPct > 0 && (
                                <span className="text-[9px] font-extrabold text-green-500 block">-{fareInfo.discountPct}% applied</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 items-center px-1 text-xs text-center border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
                            <div className="text-left">
                              <span className="font-extrabold text-gray-850 dark:text-white">{formatTime(f.departure)}</span>
                              <span className="block text-[10px] text-gray-400">{f.origin}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-455 block leading-tight">{getDuration(f.departure, f.arrival)}</span>
                              <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-full my-0.5 relative">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-1.5 flex items-center justify-center">
                                  <FlightIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transform -rotate-45" />
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-gray-850 dark:text-white">{formatTime(f.arrival)}</span>
                              <span className="block text-[10px] text-gray-400">{f.destination}</span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 bg-booking-lightblue text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md animate-scale-in">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Standard One-way List Layout */}
          {!loading && !isRoundTrip && (
            <>
              {processedOutbound.length === 0 ? (
                <div className="card p-12 text-center animate-scale-in max-w-lg mx-auto border border-gray-205 dark:border-gray-800">
                  <div className="flex justify-center mb-4">
                    <FlightIcon className="w-16 h-16 text-gray-300 dark:text-gray-655 transform -rotate-45" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-855 dark:text-gray-200 mb-2">
                    {t("no_matching_flights")}
                  </h2>
                  <p className="text-xs text-gray-505 mb-6">
                    {t("try_relaxing_filters")}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedAirlines([]);
                      setSelectedTimes([]);
                      setSortBy("cheapest");
                    }}
                    className="btn-primary"
                  >
                    {t("reset_search_filters")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedOutbound.map((f, index) => (
                    <div
                      key={f.id}
                      style={{ animationDelay: `${index * 0.08}s` }}
                      className="animate-slide-up"
                    >
                      {/* Pass specialFare to FlightCard so the detail page URL carries it */}
                      <FlightCard f={f} origin={origin} destination={destination} specialFare={specialFare} fareDiscountPct={fareInfo.discountPct} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* AI Chat recommendations */}
          {!loading && processedOutbound.length > 0 && (
            <div className="mt-16 animate-fade-in max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-905 border border-gray-205/60 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-soft">
                <h2 className="text-lg md:text-xl font-extrabold text-gray-855 dark:text-white mb-3 flex items-center gap-2">
                  <span>🤖</span>
                  <span>{t("interactive_ai_recommendations")}</span>
                </h2>
                <p className="text-xs md:text-sm text-gray-505 dark:text-gray-400 mb-6 leading-relaxed font-semibold">
                  {t("interactive_ai_recommendations_desc")}
                </p>
                <div className="rounded-2xl overflow-hidden border border-gray-205 dark:border-gray-800 h-[500px]">
                  <EnhancedAiChat sessionId={`session-${origin}-${destination}`} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Bottom Bar for Round-trip Selection Confirmation */}
      {isRoundTrip && (selectedOutbound || selectedReturn) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6 shadow-2xl z-45 animate-slide-up">
          <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Selections Overview */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              {selectedOutbound ? (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-850 p-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 min-w-0">
                  <span className="text-booking-lightblue font-bold shrink-0">{t("outbound")}</span>
                  <span className="font-extrabold text-gray-850 dark:text-white truncate">{selectedOutbound.airline}</span>
                  <span className="shrink-0">({selectedOutbound.flightNumber})</span>
                  <span className="shrink-0">{formatTime(selectedOutbound.departure)}</span>
                  <span className="text-booking-lightblue font-bold shrink-0">₹{(applyFareDiscount(selectedOutbound.basePriceCents) / 100).toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <div className="text-red-550 font-bold uppercase tracking-wider py-2">
                  {t("select_departure_flight")}
                </div>
              )}

              {selectedReturn ? (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-855 p-2 rounded-xl border border-gray-205/50 dark:border-gray-700/50 min-w-0">
                  <span className="text-booking-lightblue font-bold shrink-0">{t("return_capital")}</span>
                  <span className="font-extrabold text-gray-855 dark:text-white truncate">{selectedReturn.airline}</span>
                  <span className="shrink-0">({selectedReturn.flightNumber})</span>
                  <span className="shrink-0">{formatTime(selectedReturn.departure)}</span>
                  <span className="text-booking-lightblue font-bold shrink-0">₹{(applyFareDiscount(selectedReturn.basePriceCents) / 100).toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <div className="text-red-550 font-bold uppercase tracking-wider py-2">
                  {t("select_return_flight")}
                </div>
              )}
            </div>

            {/* Combined Pricing and Checkout CTA */}
            <div className="flex items-center gap-5 justify-between w-full md:w-auto">
              {selectedOutbound && selectedReturn && (
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">{t("combined_total_fares")}</span>
                  {fareInfo.discountPct > 0 && (
                    <div className="text-sm text-gray-400 line-through">
                      ₹{((selectedOutbound.basePriceCents + selectedReturn.basePriceCents) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                  <div className="text-2xl font-extrabold text-booking-lightblue font-display tracking-tight leading-none">
                    ₹{((applyFareDiscount(selectedOutbound.basePriceCents) + applyFareDiscount(selectedReturn.basePriceCents)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {fareInfo.discountPct > 0 && (
                    <div className="text-[10px] text-green-500 font-extrabold mt-0.5">{fareInfo.icon} {fareInfo.discountPct}% {fareInfo.label} discount</div>
                  )}
                </div>
              )}

              <button
                onClick={handleBookRoundtrip}
                disabled={!selectedOutbound || !selectedReturn}
                className="btn-primary py-3.5 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-extrabold tracking-wider"
              >
                {t("book_round_trip")}
              </button>
            </div>

          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
