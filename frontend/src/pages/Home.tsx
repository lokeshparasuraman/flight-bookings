import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EnhancedAiChat from "../components/EnhancedAiChat";
import { useLanguage } from "../contexts/LanguageContext";

import {
  FlightIcon,
  HotelIcon,
  VillaIcon,
  HolidayIcon,
  TrainIcon,
  BusIcon,
  CabIcon,
  ToursIcon,
  VisaIcon,
  CruiseIcon,
  ForexIcon,
  InsuranceIcon,
  SecureIcon,
  FlashIcon,
  RobotIcon,
  ChatBubbleIcon,
  TagIcon
} from "../components/Icons";
import Footer from "../components/Footer";

export default function Home() {
  const { t } = useLanguage();
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("BOM");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [travelers, setTravelers] = useState<number | "">(1);
  const [showAiChat, setShowAiChat] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedExplorePlace, setSelectedExplorePlace] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedSpecialFare, setSelectedSpecialFare] = useState("regular");
  const [hotelCity, setHotelCity] = useState("Delhi, NCR, India");
  const [homestayCity, setHomestayCity] = useState("Coorg, Karnataka, India");
  const [holidayDest, setHolidayDest] = useState("Goa, India");
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [insuranceCountry, setInsuranceCountry] = useState("Thailand");

  const handleSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  React.useEffect(() => {
    setActiveImageIndex(0);
    if (!selectedExplorePlace) return;
    const imgs = selectedExplorePlace.imgs || [selectedExplorePlace.img];
    if (imgs.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [selectedExplorePlace]);

  const allPlaces = [
    // Flights category
    { id: "agra", type: "flights", state: "Uttar Pradesh", code: "DEL", titleKey: "places_agra_title", descKey: "places_agra_desc", detailsKey: "places_agra_details", highlightsKey: "places_agra_highlights", bestTimeKey: "places_agra_best_time", img: "/places/taj_mahal.png", imgs: ["/places/taj_mahal.png", "/places/taj_mahal_detail.png"], price: "₹2,499" },
    { id: "goa", type: "flights", state: "Goa", code: "GOI", titleKey: "places_goa_title", descKey: "places_goa_desc", detailsKey: "places_goa_details", highlightsKey: "places_goa_highlights", bestTimeKey: "places_goa_best_time", img: "/places/goa_beach.png", imgs: ["/places/goa_beach.png", "/places/goa_sunset.png"], price: "₹3,199" },
    { id: "kerala", type: "flights", state: "Kerala", code: "COK", titleKey: "places_kerala_title", descKey: "places_kerala_desc", detailsKey: "places_kerala_details", highlightsKey: "places_kerala_highlights", bestTimeKey: "places_kerala_best_time", img: "/places/kerala_houseboat.png", imgs: ["/places/kerala_houseboat.png"], price: "₹4,299" },
    { id: "ooty_tn_flight", type: "flights", state: "Tamil Nadu", code: "CJB", titleKey: "places_ooty_tn_title", descKey: "places_ooty_tn_desc", detailsKey: "places_ooty_tn_details", highlightsKey: "places_ooty_tn_highlights", bestTimeKey: "places_ooty_tn_best_time", img: "/places/ooty_tea_gardens.png", imgs: ["/places/ooty_tea_gardens.png"], price: "₹3,499" },
    { id: "madurai_tn_flight", type: "flights", state: "Tamil Nadu", code: "IXM", titleKey: "places_madurai_tn_title", descKey: "places_madurai_tn_desc", detailsKey: "places_madurai_tn_details", highlightsKey: "places_madurai_tn_highlights", bestTimeKey: "places_madurai_tn_best_time", img: "/places/madurai_temple.png", imgs: ["/places/madurai_temple.png"], price: "₹2,999" },
    { id: "mahabalipuram_tn_flight", type: "flights", state: "Tamil Nadu", code: "MAA", titleKey: "places_mahabalipuram_tn_title", descKey: "places_mahabalipuram_tn_desc", detailsKey: "places_mahabalipuram_tn_details", highlightsKey: "places_mahabalipuram_tn_highlights", bestTimeKey: "places_mahabalipuram_tn_best_time", img: "/places/mahabalipuram_shore.png", imgs: ["/places/mahabalipuram_shore.png"], price: "₹2,799" },

    // Hotels category
    { id: "udaipur", type: "hotels", state: "Rajasthan", titleKey: "places_udaipur_title", descKey: "places_udaipur_desc", detailsKey: "places_udaipur_details", highlightsKey: "places_udaipur_highlights", bestTimeKey: "places_udaipur_best_time", img: "/places/lake_palace.png", imgs: ["/places/lake_palace.png"], rating: "4.9 ★" },
    { id: "delhi", type: "hotels", state: "Delhi", titleKey: "places_delhi_title", descKey: "places_delhi_desc", detailsKey: "places_delhi_details", highlightsKey: "places_delhi_highlights", bestTimeKey: "places_delhi_best_time", img: "/places/delhi_imperial.png", imgs: ["/places/delhi_imperial.png"], rating: "4.8 ★" },

    // Homestays category
    { id: "coorg", type: "homestays", state: "Karnataka", titleKey: "places_coorg_title", descKey: "places_coorg_desc", detailsKey: "places_coorg_details", highlightsKey: "places_coorg_highlights", bestTimeKey: "places_coorg_best_time", img: "/places/coorg_plantation.png", imgs: ["/places/coorg_plantation.png"], rating: "4.7 ★" },
    { id: "kodaikanal_tn_home", type: "homestays", state: "Tamil Nadu", titleKey: "places_kodaikanal_tn_title", descKey: "places_kodaikanal_tn_desc", detailsKey: "places_kodaikanal_tn_details", highlightsKey: "places_kodaikanal_tn_highlights", bestTimeKey: "places_kodaikanal_tn_best_time", img: "/places/coorg_plantation.png", imgs: ["/places/coorg_plantation.png"], rating: "4.6 ★" },

    // Buses category
    { id: "ooty", type: "buses", state: "Tamil Nadu", titleKey: "places_ooty_title", descKey: "places_ooty_desc", detailsKey: "places_ooty_details", highlightsKey: "places_ooty_highlights", bestTimeKey: "places_ooty_best_time", img: "/places/ooty_tea_gardens.png", imgs: ["/places/ooty_tea_gardens.png"], price: "₹899" },

    // Cruise category
    { id: "lakshadweep", type: "cruise", state: "Lakshadweep", titleKey: "places_lakshadweep_title", descKey: "places_lakshadweep_desc", detailsKey: "places_lakshadweep_details", highlightsKey: "places_lakshadweep_highlights", bestTimeKey: "places_lakshadweep_best_time", img: "/places/lakshadweep_cruise.png", imgs: ["/places/lakshadweep_cruise.png", "/places/lakshadweep_beach.png"], price: "₹18,500" },

    // Tours category
    { id: "ajanta", type: "tours", state: "Maharashtra", titleKey: "places_ajanta_title", descKey: "places_ajanta_desc", detailsKey: "places_ajanta_details", highlightsKey: "places_ajanta_highlights", bestTimeKey: "places_ajanta_best_time", img: "/places/ajanta_caves.png", imgs: ["/places/ajanta_caves.png"], durationKey: "places_ajanta_duration" },
    { id: "madurai_tn_tour", type: "tours", state: "Tamil Nadu", titleKey: "places_madurai_tn_title", descKey: "places_madurai_tn_desc", detailsKey: "places_madurai_tn_details", highlightsKey: "places_madurai_tn_highlights", bestTimeKey: "places_madurai_tn_best_time", img: "/places/madurai_temple.png", imgs: ["/places/madurai_temple.png"], price: "₹1,499" },
    { id: "mahabalipuram_tn_tour", type: "tours", state: "Tamil Nadu", titleKey: "places_mahabalipuram_tn_title", descKey: "places_mahabalipuram_tn_desc", detailsKey: "places_mahabalipuram_tn_details", highlightsKey: "places_mahabalipuram_tn_highlights", bestTimeKey: "places_mahabalipuram_tn_best_time", img: "/places/mahabalipuram_shore.png", imgs: ["/places/mahabalipuram_shore.png"], price: "₹999" },
    { id: "rameshwaram_tn_tour", type: "tours", state: "Tamil Nadu", titleKey: "places_rameshwaram_tn_title", descKey: "places_rameshwaram_tn_desc", detailsKey: "places_rameshwaram_tn_details", highlightsKey: "places_rameshwaram_tn_highlights", bestTimeKey: "places_rameshwaram_tn_best_time", img: "/places/lakshadweep_beach.png", imgs: ["/places/lakshadweep_beach.png"], price: "₹2,199" }
  ];

  const nav = useNavigate();



  function search(e: React.FormEvent) {
    e.preventDefault();
    const d = String(date || "");
    const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    const iso = m ? `${m[3]}-${m[2]}-${m[1]}` : d;

    let queryParams = `origin=${origin}&destination=${destination}&date=${iso}&tripType=${tripType}`;
    if (tripType === "roundtrip") {
      const rd = String(returnDate || "");
      const rm = rd.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      const isoReturn = rm ? `${rm[3]}-${rm[2]}-${rm[1]}` : rd;
      queryParams += `&returnDate=${isoReturn}`;
    }
    nav(`/search?${queryParams}`);
  }

  const today = new Date().toISOString().split('T')[0];

  const getAirportName = (code: string) => {
    const mapping: Record<string, string> = {
      DEL: "New Delhi, Indira Gandhi Intl Airport",
      BOM: "Mumbai, Chhatrapati Shivaji Maharaj Airport",
      BLR: "Bengaluru, Kempegowda Airport",
      MAA: "Chennai International Airport",
      CCU: "Kolkata, Netaji Bose Airport",
      HYD: "Hyderabad, Rajiv Gandhi Airport",
      PNQ: "Pune Airport",
      AMD: "Ahmedabad Airport",
      GOI: "Goa, Dabolim Airport",
      COK: "Kochi, Cochin Airport",
      JAI: "Jaipur Airport",
      MYS: "Mysore Airport"
    };
    return mapping[code.toUpperCase()] || "Airport, India";
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return { day: "--", monthYear: "Select Date", weekday: "" };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: "--", monthYear: "Select Date", weekday: "" };
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: 'short' });
    const year = d.toLocaleDateString("en-US", { year: 'numeric' });
    const monthYear = `${month}' ${year.slice(-2)}`;
    const weekday = d.toLocaleDateString("en-US", { weekday: 'long' });
    return { day, monthYear, weekday };
  };

  const specialFaresOptions = [
    { id: "regular", title: "Regular", desc: "Regular Fares", badge: null },
    { id: "student", title: "Student", desc: "Extra Baggage", badge: "Student" },
    { id: "armed", title: "Armed Forces", desc: "Special Discounts", badge: "Defense" },
    { id: "senior", title: "Senior Citizen", desc: "Up to 10% off", badge: "Senior" },
    { id: "gst", title: "GST Business", desc: "Claim Tax Credit", badge: "Corporate" }
  ];

  const tabs = [
    { id: "flights", label: "Flights" },
    { id: "hotels", label: "Hotels" },
    { id: "homestays", label: "Villas & Homestays" },
    { id: "holidays", label: "Holiday Packages" },
    { id: "trains", label: "Trains" },
    { id: "buses", label: "Buses" },
    { id: "cabs", label: "Cabs" },
    { id: "tours", label: "Tours & Attractions" },
    { id: "cruise", label: "Cruise", badge: "new" },
    { id: "insurance", label: "Travel Insurance" }
  ];

  const renderTabIcon = (id: string, className: string) => {
    switch (id) {
      case "flights": return <FlightIcon className={className} />;
      case "hotels": return <HotelIcon className={className} />;
      case "homestays": return <VillaIcon className={className} />;
      case "holidays": return <HolidayIcon className={className} />;
      case "trains": return <TrainIcon className={className} />;
      case "buses": return <BusIcon className={className} />;
      case "cabs": return <CabIcon className={className} />;
      case "tours": return <ToursIcon className={className} />;
      case "visa": return <VisaIcon className={className} />;
      case "cruise": return <CruiseIcon className={className} />;
      case "forex": return <ForexIcon className={className} />;
      case "insurance": return <InsuranceIcon className={className} />;
      default: return <FlightIcon className={className} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans">
      <div className="relative z-10">
        <Header />

        {/* Hero Banner Area */}
        <div
          className="relative bg-cover bg-center text-white pt-10 pb-36 px-4"
          style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
        >
          {/* Overlay to ensure readability and dark mode contrast */}
          <div className="absolute inset-0 bg-[#18181b]/40 dark:bg-[#09090b]/80 z-0"></div>

          <div className="container max-w-6xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              {t("compare_book")}
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto font-medium">
              {t("save_big")}
            </p>
          </div>
        </div>

        {/* Main Search Panel Container (Floating Over Hero) */}
        <div className="container max-w-6xl mx-auto -mt-24 px-4 relative z-20">

          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-xl rounded-3xl mb-6 w-full grid grid-cols-5 md:grid-cols-10 select-none px-2 py-3 relative z-30 gap-y-2 gap-x-1 md:gap-x-2">
            {tabs.map((tab: any) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id)}
                  data-tooltip-bottom={tab.disabled ? `${t("coming_soon")}: ${t(tab.id)}` : `${t("search")} ${t(tab.id)}`}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-200 outline-none rounded-2xl group w-full ${isActive
                    ? "text-[#008cff] font-extrabold scale-105"
                    : "text-gray-555 dark:text-gray-400 hover:text-[#008cff] dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                >
                  {tab.badge && (
                    <span className="absolute top-0 right-0 md:right-2 bg-[#d946ef] text-white text-[7px] md:text-[8px] font-extrabold px-1 py-0.2 md:px-1.5 md:py-0.5 uppercase tracking-wide rounded-full shadow-sm scale-90 select-none animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  <div className={`flex items-center justify-center mb-1 p-1.5 md:p-2 rounded-full transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-955/40 text-[#008cff]" : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-955/20 group-hover:text-[#008cff]"}`}>
                    {renderTabIcon(tab.id, "w-5 h-5 md:w-6 md:h-6")}
                  </div>
                  <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider leading-tight block whitespace-nowrap">
                    {t(`tab_${tab.id}_l1`)}
                  </span>
                  <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider leading-tight block whitespace-nowrap">
                    {t(`tab_${tab.id}_l2`)}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-10 h-0.5 md:h-1 bg-[#008cff] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/70 dark:border-gray-800/80 p-6 md:p-8 animate-scale-in relative z-20">

            {/* FlyFast AI Assistant Search Widget with colorful gradient border */}
            <div 
              className="p-[1.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-[#008cff] rounded-2xl mb-6 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200" 
              onClick={() => setShowAiChat(true)}
            >
              <div className="bg-white dark:bg-gray-900 rounded-[14px] px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-[#008cff] flex items-center justify-center text-white shadow-sm">
                    <RobotIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
                      FlyFast AI Assistant
                      <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Beta</span>
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                      Search flights with natural language, e.g., "Find flights from Delhi to Mumbai tomorrow"
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0">
                  <span>Ask FlyFast AI</span>
                  <span>➔</span>
                </div>
              </div>
            </div>

            {/* Trip Type Select Row */}
            <div className="flex items-center justify-between gap-6 mb-6 pb-4 border-b border-gray-150 dark:border-gray-800">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="triptype"
                    checked={tripType === "oneway"}
                    onChange={() => setTripType("oneway")}
                    className="w-4.5 h-4.5 text-[#008cff] focus:ring-[#008cff] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-850"
                  />
                  <span className={`text-sm font-bold tracking-wide transition-colors ${tripType === "oneway" ? "text-[#008cff]" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
                    {t("one_way")}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="triptype"
                    checked={tripType === "roundtrip"}
                    onChange={() => setTripType("roundtrip")}
                    className="w-4.5 h-4.5 text-[#008cff] focus:ring-[#008cff] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-850"
                  />
                  <span className={`text-sm font-bold tracking-wide transition-colors ${tripType === "roundtrip" ? "text-[#008cff]" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
                    {t("round_trip")}
                  </span>
                </label>
              </div>
              <div className="hidden md:block text-xs font-bold text-gray-405 dark:text-gray-505 uppercase tracking-wider">
                Book Domestic & International Flights
              </div>
            </div>

            {/* Manual Flight Search Form */}
            <form id="search-form" onSubmit={search} className="relative">
              {/* Search Form Fields Grid */}
              {activeTab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-5 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From & To Combo with Floating Swap Button */}
                  <div className="md:col-span-2 relative flex flex-col md:grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                    {/* From Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{t("from")}</span>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="DEL"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold" title={getAirportName(origin)}>
                        {getAirportName(origin)}
                      </span>
                    </div>

                    {/* To Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{t("to")}</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="BOM"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold" title={getAirportName(destination)}>
                        {getAirportName(destination)}
                      </span>
                    </div>

                    {/* Absolute Swap Button */}
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="absolute z-35 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg flex items-center justify-center text-[#008cff] dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer active:scale-90
                        bottom-0 right-6 translate-y-1/2 md:bottom-auto md:right-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                      title="Swap airports"
                    >
                      <span className="text-lg font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Departure Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{t("departure")}</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Return Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    const isOneWay = tripType === "oneway";
                    return (
                      <div 
                        onClick={() => {
                          if (isOneWay) setTripType("roundtrip");
                        }}
                        className={`bg-white dark:bg-gray-900 p-5 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px] ${
                          isOneWay 
                            ? "hover:bg-blue-50/10 dark:hover:bg-blue-955/5" 
                            : "hover:bg-blue-50/20 dark:hover:bg-blue-955/10"
                        }`}
                      >
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{t("return")}</span>
                        {isOneWay ? (
                          <>
                            <span className="text-xl font-extrabold text-[#008cff] mt-1">+ {t("add")} {t("return")}</span>
                            <span className="block text-xs text-gray-450 dark:text-gray-555 mt-1 font-semibold">
                              {t("tap_roundtrip")}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                              <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                            </div>
                            <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                            <input
                              type="date"
                              value={returnDate}
                              min={date || today}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                              required={tripType === "roundtrip"}
                            />
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Travelers Info */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{t("travelers")}</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="1"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Traveler(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      {t("economy_class")}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "hotels" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* City/Location */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">City, Property or Location</span>
                    <input
                      type="text"
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Delhi, India"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">India</span>
                  </div>

                  {/* Check-In Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-In Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Check-Out Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-Out Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                        <input
                          type="date"
                          value={returnDate}
                          min={date || today}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Rooms & Guests */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Rooms & Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="1"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Guest(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      1 Room / Deluxe Class
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "homestays" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* City/Location */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">City, Locality or Villa Name</span>
                    <input
                      type="text"
                      value={homestayCity}
                      onChange={(e) => setHomestayCity(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Coorg, Karnataka"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Karnataka</span>
                  </div>

                  {/* Check-In Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-In Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Check-Out Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-Out Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                        <input
                          type="date"
                          value={returnDate}
                          min={date || today}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Guests */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="2"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Guest(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Entire Villa / Homestay
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "holidays" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From City */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">From City</span>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="DEL"
                      maxLength={3}
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">New Delhi, India</span>
                  </div>

                  {/* To Destination */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">To Destination / Package</span>
                    <input
                      type="text"
                      value={holidayDest}
                      onChange={(e) => setHolidayDest(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Goa, India"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">India</span>
                  </div>

                  {/* Departure Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Departure Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Travelers */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="2"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Traveler(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Flights + Hotel Package
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "trains" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From & To Combo with Floating Swap Button */}
                  <div className="md:col-span-2 relative flex flex-col md:grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                    {/* From Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">From Station</span>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-850 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="DEL"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        New Delhi Station
                      </span>
                    </div>

                    {/* To Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">To Station</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="BOM"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        Mumbai Central
                      </span>
                    </div>

                    {/* Absolute Swap Button */}
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="absolute z-35 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg flex items-center justify-center text-[#008cff] dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer active:scale-90
                        bottom-0 right-6 translate-y-1/2 md:bottom-auto md:right-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                      title="Swap Stations"
                    >
                      <span className="text-lg font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Travel Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Travel Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Class */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Class & Quota</span>
                    <span className="block text-xl font-extrabold text-gray-855 dark:text-white mt-1">All Classes</span>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      General Quota (GN)
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "buses" && (
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From & To Combo with Floating Swap Button */}
                  <div className="md:col-span-2 relative flex flex-col md:grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                    {/* From Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">From City</span>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-850 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="DEL"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        Delhi, India
                      </span>
                    </div>

                    {/* To Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-55/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">To City</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="BOM"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        Mumbai, India
                      </span>
                    </div>

                    {/* Absolute Swap Button */}
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="absolute z-35 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg flex items-center justify-center text-[#008cff] dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer active:scale-90
                        bottom-0 right-6 translate-y-1/2 md:bottom-auto md:right-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                      title="Swap Cities"
                    >
                      <span className="text-lg font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Travel Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Travel Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "cabs" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Pick-Up City */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Pick-Up City</span>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="DEL"
                      maxLength={3}
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Delhi, India</span>
                  </div>

                  {/* Drop-Off City */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Drop-Off City</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="BOM"
                      maxLength={3}
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Mumbai, India</span>
                  </div>

                  {/* Pickup Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Pickup Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Pickup Time */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px] relative">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Pickup Time</span>
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none"
                      placeholder="10:00 AM"
                      required
                    />
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Outstation Oneway
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "tours" && (
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Destination/Attraction */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Destination / Attraction</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Agra, Taj Mahal"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Activities & Day Trips</span>
                  </div>

                  {/* Visit Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Visit Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Tickets */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Tickets / Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="1"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Ticket(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Standard Entry Access
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "cruise" && (
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Destination */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Cruise Destination</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Lakshadweep Islands"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">India Cruising</span>
                  </div>

                  {/* Departure Month / Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Departure Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Guests & Cabins */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests & Cabins</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="2"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Guest(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      1 Cabin / Oceanview
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "insurance" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Destination Country */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Destination Country</span>
                    <input
                      type="text"
                      value={insuranceCountry}
                      onChange={(e) => setInsuranceCountry(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Thailand"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Global Coverage</span>
                  </div>

                  {/* Start Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Trip Start Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* End Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Trip End Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                        <input
                          type="date"
                          value={returnDate}
                          min={date || today}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Travelers Age */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Traveler's Age</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="25"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Traveler(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Schengen & Worldwide Approved
                    </span>
                  </div>
                </div>
              )}

              {/* Special Fares Selector Row */}
              {activeTab === "flights" && (
                <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3">
                  <span className="text-xs font-extrabold text-gray-400 dark:text-gray-505 uppercase tracking-wider shrink-0">
                    {t("special_fares")}:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {specialFaresOptions.map((option) => {
                      const isSelected = selectedSpecialFare === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedSpecialFare(option.id)}
                          className={`flex flex-col items-start px-4 py-2 border rounded-xl transition-all text-left relative ${
                            isSelected
                              ? "border-[#008cff] bg-blue-50/40 dark:bg-blue-955/20 text-[#008cff]"
                              : "border-gray-255 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 text-gray-755 dark:text-gray-300"
                          }`}
                        >
                          {option.badge && (
                            <span className="absolute -top-2 right-2 bg-gradient-to-r from-purple-500 to-[#008cff] text-white text-[7px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider scale-90">
                              {option.badge}
                            </span>
                          )}
                          <span className="text-xs font-extrabold">{option.title}</span>
                          <span className="text-[9px] text-gray-450 dark:text-gray-500 font-semibold">{option.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* SEARCH BUTTON (Centered below the ticket options box) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 relative max-w-2xl mx-auto px-4">
            <div className="relative">
              <button
                onClick={() => {
                  const formEl = document.getElementById("search-form") as HTMLFormElement;
                  if (formEl) formEl.requestSubmit();
                }}
                data-tooltip={t(`search_${activeTab}`)}
                className="px-16 py-4 text-lg bg-gradient-to-r from-[#008cff] to-[#007cdb] hover:from-[#007cdb] hover:to-[#006cc7] text-white font-extrabold rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 flex items-center justify-center gap-2 group tracking-wider uppercase min-w-[240px]"
              >
                <span>{t(`search_${activeTab}`)}</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-200">➔</span>
              </button>
            </div>

            {/* The popup card (chatbot launcher hint) made visible just below-right of the search button */}
            <div 
              onClick={() => setShowAiChat(true)}
              className="md:absolute md:left-[calc(50%+140px)] md:top-1/2 md:-translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 shadow-lg text-xs font-bold text-gray-755 dark:text-gray-200 cursor-pointer whitespace-nowrap hover:scale-105 transition-all duration-200 animate-bounce flex items-center gap-1.5 z-30"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Ask FlyFast AI! 💬</span>
              {/* Left-pointing arrow for speech bubble on desktop, top-pointing on mobile */}
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 hidden md:block w-3 h-3 bg-white dark:bg-gray-800 border-l border-b border-gray-250 dark:border-gray-700 transform rotate-45"></div>
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 md:hidden w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-250 dark:border-gray-700 transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container max-w-6xl mx-auto pt-16 pb-20 px-4">
          {/* Places to Visit Section */}
          <div className="mb-16 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-booking-lightblue/10 text-booking-lightblue border border-booking-lightblue/20">
                  {t("explore_destinations")}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-display tracking-tight">
                  {activeTab === "flights" && t("popular_places_visit")}
                  {activeTab === "hotels" && t("featured_hotels")}
                  {activeTab === "homestays" && t("scenic_villas")}
                  {activeTab === "buses" && t("popular_bus_routes")}
                  {activeTab === "cruise" && t("stunning_cruises")}
                  {activeTab === "tours" && t("top_tours_attractions")}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {t("places_to_visit_desc")}
                </p>
                {/* Search and Filters Area */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-[#faf8f5]/60 dark:bg-gray-900/60 p-4 border border-gray-200/50 dark:border-gray-800/50 items-center justify-between">
                  {/* Text Search */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("label_search_placeholder")}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm outline-none text-gray-855 dark:text-white"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                  </div>

                  {/* State Dropdown */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("label_filter_state")}:
                    </span>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-855 border border-gray-300 dark:border-gray-700 text-sm outline-none text-gray-855 dark:text-white w-full sm:w-56"
                    >
                      <option value="all">{t("state_all")}</option>
                      <option value="Tamil Nadu">{t("state_tamilnadu")}</option>
                      <option value="Goa">{t("state_goa")}</option>
                      <option value="Kerala">{t("state_kerala")}</option>
                      <option value="Rajasthan">{t("state_rajasthan")}</option>
                      <option value="Delhi">{t("state_delhi")}</option>
                      <option value="Karnataka">{t("state_karnataka")}</option>
                      <option value="Uttar Pradesh">{t("state_uttarpradesh")}</option>
                      <option value="Lakshadweep">{t("state_lakshadweep")}</option>
                      <option value="Maharashtra">{t("state_maharashtra")}</option>
                    </select>
                  </div>
                </div>

                {/* Places Grid with w-80 sized cards */}
                {(() => {
                  const filteredPlaces = allPlaces.filter((place) => {
                    const matchesCategory = place.type === activeTab;
                    const matchesState = selectedState === "all" || place.state === selectedState;

                    const titleText = t(place.titleKey).toLowerCase();
                    const descText = t(place.descKey).toLowerCase();
                    const stateText = place.state.toLowerCase();
                    const query = searchQuery.toLowerCase();
                    const matchesQuery =
                      titleText.includes(query) ||
                      descText.includes(query) ||
                      stateText.includes(query);

                    return matchesCategory && matchesState && matchesQuery;
                  });

                  if (filteredPlaces.length === 0) {
                    return (
                      <div className="text-center py-12 bg-white dark:bg-gray-850 border border-gray-200/50 dark:border-gray-800/50 w-full">
                        <p className="text-sm font-bold text-gray-500">{t("no_matching_flights")}</p>
                        <button
                          onClick={() => {
                            setSelectedState("all");
                            setSearchQuery("");
                          }}
                          className="mt-3 text-xs font-bold text-booking-lightblue underline hover:text-booking-lightblue/80"
                        >
                          {t("reset_search_filters")}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                      {filteredPlaces.map((place: any, index: number) => (
                        <div 
                          key={index} 
                          onClick={() => setSelectedExplorePlace(place)}
                          className="shrink-0 w-80 h-[390px] bg-white dark:bg-gray-855 dark:border-gray-750/60 border border-gray-150 shadow-md overflow-hidden hover:shadow-xl hover:border-booking-lightblue/25 transition-all duration-300 flex flex-col cursor-pointer group"
                        >
                          {/* Place Image */}
                          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <img
                              src={place.img}
                              alt={t(place.titleKey)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            {place.price && (
                              <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider">
                                {t("starting_from")} {place.price}
                              </div>
                            )}
                            {place.rating && (
                              <div className="absolute bottom-3 left-3 bg-amber-500 text-gray-950 text-[10px] font-extrabold px-2.5 py-1 tracking-wider uppercase">
                                {place.rating}
                              </div>
                            )}
                            {place.durationKey && (
                              <div className="absolute bottom-3 left-3 bg-booking-lightblue text-white text-[10px] font-extrabold px-2.5 py-1 tracking-wider uppercase">
                                {t(place.durationKey)}
                              </div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-extrabold text-gray-855 dark:text-white uppercase tracking-wider">{t(place.titleKey)}</h4>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
                                  {place.state}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-semibold mt-1">
                                {t(place.descKey)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExplorePlace(place);
                              }}
                              className="w-full text-center py-2 bg-gray-50 dark:bg-gray-750 hover:bg-booking-lightblue hover:text-white text-[10px] font-extrabold text-booking-lightblue uppercase tracking-wider transition-colors duration-250 border-t border-gray-100 dark:border-gray-700/60"
                            >
                              {t("explore_now")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Quick Chat Widget Area & Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Assistant Chat Banner */}
            <div className="lg:col-span-2 bg-[#f0f7ff] dark:bg-gray-800/40 rounded-3xl p-6 md:p-8 border border-[#e0efff]/50 dark:border-gray-700/30 flex flex-col justify-between shadow-soft">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <RobotIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white">
                      {t("chat_assistant_title")}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("chat_assistant_sub")}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-655 dark:text-gray-300 leading-relaxed font-medium">
                  {t("chat_assistant_desc")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                  <button
                    onClick={() => setShowAiChat(true)}
                    className="text-left px-4 py-3 bg-white dark:bg-gray-800 hover:border-booking-lightblue border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-all font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ChatBubbleIcon className="w-4 h-4 text-booking-lightblue" />
                      <span>"{t("chats_prompt_del_bom")}"</span>
                    </span>
                    <span className="text-gray-400">➔</span>
                  </button>
                  <button
                    onClick={() => setShowAiChat(true)}
                    className="text-left px-4 py-3 bg-white dark:bg-gray-800 hover:border-booking-lightblue border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-all font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-booking-lightblue" />
                      <span>"{t("chats_prompt_blr")}"</span>
                    </span>
                    <span className="text-gray-400">➔</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowAiChat(true)}
                className="mt-6 w-full sm:w-auto self-start bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-105 text-white font-extrabold py-3.5 px-8 rounded-full transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <RobotIcon className="w-5 h-5 text-white" />
                <span>{t("open_chat_assistant")}</span>
              </button>
            </div>

            {/* Travel portal stats */}
            <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 md:p-8 rounded-3xl shadow-soft flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-extrabold text-gray-855 dark:text-white uppercase tracking-wider text-xs">
                  {t("why_flyfast")}
                </h4>
                <ul className="space-y-3.5 text-sm text-gray-655 dark:text-gray-400">
                  <li className="flex items-start gap-2.5">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{t("why_flyfast_reason1")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{t("why_flyfast_reason2")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{t("why_flyfast_reason3")}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-755 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <SecureIcon className="w-4 h-4 text-emerald-500" />
                  {t("secure_ssl")}
                </span>
                <span className="flex items-center gap-1.5">
                  <FlashIcon className="w-4 h-4 text-amber-500" />
                  {t("fast_booking")}
                </span>
              </div>
            </div>
          </div>

          {/* AI Chat Modal Dialog */}
          {showAiChat && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl h-[650px] shadow-2xl animate-scale-in overflow-hidden border border-gray-200 dark:border-gray-700">
                <EnhancedAiChat
                  onClose={() => setShowAiChat(false)}
                  sessionId="home-session"
                />
              </div>
            </div>
          )}

          {/* Rich Destination Exploration Modal */}
          {selectedExplorePlace && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">

                {/* Image Header Block with Carousel */}
                <div className="relative h-56 bg-gray-100 dark:bg-gray-955 overflow-hidden shrink-0">
                  {(() => {
                    const imgs = selectedExplorePlace.imgs || [selectedExplorePlace.img];
                    return (
                      <>
                        <img
                          src={imgs[activeImageIndex]}
                          alt={t(selectedExplorePlace.titleKey)}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                        {imgs.length > 1 && (
                          <>
                            {/* Slide Navigation Arrows */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => (prev === 0 ? imgs.length - 1 : prev - 1));
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all focus:outline-none z-10"
                            >
                              ◀
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all focus:outline-none z-10"
                            >
                              ▶
                            </button>
                            {/* Dot Indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                              {imgs.map((_: any, idx: number) => (
                                <span
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                  {/* Close floating button */}
                  <button
                    onClick={() => setSelectedExplorePlace(null)}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all focus:outline-none z-10"
                    aria-label={t("places_close_details")}
                  >
                    ✕
                  </button>

                  {/* Title labels overlay */}
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide leading-tight">
                      {t(selectedExplorePlace.titleKey)}
                    </h3>
                    <p className="text-xs text-gray-300 font-semibold mt-1">
                      {t(selectedExplorePlace.descKey)}
                    </p>
                  </div>
                </div>

                {/* Body Details Container */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left text-sm scrollbar-thin">

                  {/* Description segment */}
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
                      {t("places_overview_label")}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                      {t(selectedExplorePlace.detailsKey)}
                    </p>
                  </div>

                  {/* Bulleted attractions */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
                      {t("places_highlights_label")}
                    </h4>
                    <ul className="space-y-1.5 text-gray-500 dark:text-gray-400">
                      {t(selectedExplorePlace.highlightsKey).split(", ").map((hl: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#ff6636] font-bold">✓</span>
                          <span className="font-semibold text-xs sm:text-sm">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Seasonal advice */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
                      {t("places_best_time_label")}
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200 font-extrabold">
                      {t(selectedExplorePlace.bestTimeKey)}
                    </p>
                  </div>

                  {/* Dynamic metric (Price/Rating/Duration) footer bar */}
                  {selectedExplorePlace.price && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">{t("starting_from")}</span>
                      <span className="text-xl font-extrabold text-[#ff6636]">{selectedExplorePlace.price}</span>
                    </div>
                  )}

                  {selectedExplorePlace.rating && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">{t("places_user_rating_label")}</span>
                      <span className="text-xs font-extrabold bg-amber-500 text-gray-950 px-2 py-0.5 font-mono">{selectedExplorePlace.rating}</span>
                    </div>
                  )}

                  {selectedExplorePlace.durationKey && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">{t("places_duration_label")}</span>
                      <span className="text-xs font-extrabold text-[#ff6636] bg-[#ff6636]/10 px-2 py-0.5">{t(selectedExplorePlace.durationKey)}</span>
                    </div>
                  )}
                </div>

                {/* Footer buttons row */}
                <div className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-3">
                  <button
                    onClick={() => setSelectedExplorePlace(null)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-extrabold text-xs uppercase tracking-wider transition-colors hover:bg-gray-100 dark:hover:bg-gray-850"
                  >
                    {t("places_close_details")}
                  </button>

                  {activeTab === "flights" && selectedExplorePlace.code && (
                    <button
                      onClick={() => {
                        setDestination(selectedExplorePlace.code);
                        setSelectedExplorePlace(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#ff6636] to-[#ff3600] text-white font-extrabold text-xs uppercase tracking-wider transition-all hover:brightness-105 shadow-md"
                    >
                      {t("places_action_select")}
                    </button>
                  )}

                  {activeTab !== "flights" && (
                    <button
                      onClick={() => {
                        setSelectedExplorePlace(null);
                        // Redirect user visually back to target category console
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-3 bg-booking-lightblue text-white font-extrabold text-xs uppercase tracking-wider transition-all hover:brightness-105 shadow-md"
                    >
                      {t("places_action_book")}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Floating Cute Robot Chat Widget */}
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group select-none">
            {/* Speech Bubble */}
            <div 
              onClick={() => setShowAiChat(true)}
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 shadow-lg text-xs font-bold text-gray-755 dark:text-gray-200 cursor-pointer whitespace-nowrap hover:scale-105 transition-all duration-200 animate-bounce"
            >
              Ask FlyFast AI! 💬
              {/* Small arrow for speech bubble */}
              <div className="absolute right-4 bottom-[-6px] w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-250 dark:border-gray-700 transform rotate-45"></div>
            </div>
            
            {/* Robot Circular Trigger */}
            <button
              onClick={() => setShowAiChat(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-[#008cff] flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer relative"
              aria-label="Open AI Assistant"
            >
              <RobotIcon className="w-7 h-7 text-white animate-pulse" />
              {/* Active dot indicator */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
