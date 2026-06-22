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

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedExplorePlace]);

  const destinationHighlights = {
    flights: [
      { id: "agra", code: "DEL", titleKey: "places_agra_title", descKey: "places_agra_desc", detailsKey: "places_agra_details", highlightsKey: "places_agra_highlights", bestTimeKey: "places_agra_best_time", img: "/places/taj_mahal.png", imgs: ["/places/taj_mahal.png", "/places/taj_mahal_detail.png"], price: "₹2,499" },
      { id: "goa", code: "GOI", titleKey: "places_goa_title", descKey: "places_goa_desc", detailsKey: "places_goa_details", highlightsKey: "places_goa_highlights", bestTimeKey: "places_goa_best_time", img: "/places/goa_beach.png", imgs: ["/places/goa_beach.png", "/places/goa_sunset.png"], price: "₹3,199" },
      { id: "kerala", code: "COK", titleKey: "places_kerala_title", descKey: "places_kerala_desc", detailsKey: "places_kerala_details", highlightsKey: "places_kerala_highlights", bestTimeKey: "places_kerala_best_time", img: "/places/kerala_houseboat.png", imgs: ["/places/kerala_houseboat.png"], price: "₹4,299" }
    ],
    hotels: [
      { id: "udaipur", titleKey: "places_udaipur_title", descKey: "places_udaipur_desc", detailsKey: "places_udaipur_details", highlightsKey: "places_udaipur_highlights", bestTimeKey: "places_udaipur_best_time", img: "/places/lake_palace.png", imgs: ["/places/lake_palace.png", "/places/goa_sunset.png"], rating: "4.9 ★" },
      { id: "delhi", titleKey: "places_delhi_title", descKey: "places_delhi_desc", detailsKey: "places_delhi_details", highlightsKey: "places_delhi_highlights", bestTimeKey: "places_delhi_best_time", img: "/places/delhi_imperial.png", imgs: ["/places/delhi_imperial.png", "/places/taj_mahal_detail.png"], rating: "4.8 ★" }
    ],
    homestays: [
      { id: "coorg", titleKey: "places_coorg_title", descKey: "places_coorg_desc", detailsKey: "places_coorg_details", highlightsKey: "places_coorg_highlights", bestTimeKey: "places_coorg_best_time", img: "/places/coorg_plantation.png", imgs: ["/places/coorg_plantation.png", "/places/lake_palace.png"], rating: "4.7 ★" }
    ],
    buses: [
      { id: "ooty", titleKey: "places_ooty_title", descKey: "places_ooty_desc", detailsKey: "places_ooty_details", highlightsKey: "places_ooty_highlights", bestTimeKey: "places_ooty_best_time", img: "/places/ooty_tea_gardens.png", imgs: ["/places/ooty_tea_gardens.png", "/places/kerala_houseboat.png"], price: "₹899" }
    ],
    cruise: [
      { id: "lakshadweep", titleKey: "places_lakshadweep_title", descKey: "places_lakshadweep_desc", detailsKey: "places_lakshadweep_details", highlightsKey: "places_lakshadweep_highlights", bestTimeKey: "places_lakshadweep_best_time", img: "/places/lakshadweep_cruise.png", imgs: ["/places/lakshadweep_cruise.png", "/places/lakshadweep_beach.png"], price: "₹18,500" }
    ],
    tours: [
      { id: "ajanta", titleKey: "places_ajanta_title", descKey: "places_ajanta_desc", detailsKey: "places_ajanta_details", highlightsKey: "places_ajanta_highlights", bestTimeKey: "places_ajanta_best_time", img: "/places/ajanta_caves.png", imgs: ["/places/ajanta_caves.png", "/places/taj_mahal_detail.png"], durationKey: "places_ajanta_duration" }
    ]
  };
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

  const tabs = [
    { id: "flights", label: "Flights" },
    { id: "hotels", label: "Hotels" },
    { id: "homestays", label: "Villas & Homestays" },
    { id: "holidays", label: "Holiday Packages", disabled: true },
    { id: "trains", label: "Trains", disabled: true },
    { id: "buses", label: "Buses" },
    { id: "cabs", label: "Cabs", disabled: true },
    { id: "tours", label: "Tours & Attractions" },
    { id: "visa", label: "Visa", disabled: true },
    { id: "cruise", label: "Cruise", badge: "new" },
    { id: "forex", label: "Forex Card & Currency", disabled: true },
    { id: "insurance", label: "Travel Insurance", disabled: true }
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
          
          {/* MakeMyTrip-Style Premium Category Navigation Bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/65 dark:border-gray-750 shadow-lg mb-6 overflow-x-auto w-full flex justify-start items-stretch select-none scrollbar-thin">
            {tabs.map((tab: any) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id)}
                  data-tooltip-bottom={tab.disabled ? `${t("coming_soon")}: ${t(tab.id)}` : `${t("search")} ${t(tab.id)}`}
                  className={`relative flex flex-col items-center justify-between py-4 px-4 border-b-4 min-w-[125px] shrink-0 text-center transition-all duration-150 outline-none ${
                    isActive
                      ? "border-booking-lightblue text-booking-lightblue font-extrabold"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-booking-lightblue dark:hover:text-booking-lightblue hover:bg-gray-50/50 dark:hover:bg-gray-750/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
                  }`}
                >
                  {tab.badge && (
                    <span className="absolute top-1.5 right-6 bg-[#d946ef] text-white text-[8px] font-extrabold px-1.5 py-0.5 uppercase tracking-wide shadow-sm scale-90 select-none animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  <div className="flex items-center justify-center mb-2">
                    {renderTabIcon(tab.id, `w-7 h-7 ${isActive ? "text-booking-lightblue" : "text-gray-400 dark:text-gray-500"}`)}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider leading-none whitespace-nowrap block">
                    {t(tab.id)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-805 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 animate-scale-in">
            
            {/* Trip Type Select Row */}
            <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-150 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="triptype"
                  checked={tripType === "oneway"}
                  onChange={() => setTripType("oneway")}
                  className="w-4.5 h-4.5 text-booking-lightblue focus:ring-booking-lightblue border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-850"
                />
                <span className={`text-sm font-bold tracking-wide transition-colors ${tripType === "oneway" ? "text-booking-lightblue" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
                  {t("one_way")}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="triptype"
                  checked={tripType === "roundtrip"}
                  onChange={() => setTripType("roundtrip")}
                  className="w-4.5 h-4.5 text-booking-lightblue focus:ring-booking-lightblue border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-850"
                />
                <span className={`text-sm font-bold tracking-wide transition-colors ${tripType === "roundtrip" ? "text-booking-lightblue" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
                  {t("round_trip")}
                </span>
              </label>
            </div>

            {/* Manual Flight Search Form */}
            <form onSubmit={search} className="relative">
              {/* Search Form Fields Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0.5 bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* From Field */}
                <div className="bg-white dark:bg-gray-850 p-4 hover:bg-booking-lightblue/5 dark:hover:bg-booking-lightblue/5 transition-colors cursor-pointer group">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("from")}</span>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    className="w-full bg-transparent font-extrabold text-2xl text-gray-800 dark:text-white outline-none placeholder-gray-400 group-hover:text-booking-lightblue dark:group-hover:text-booking-lightblue"
                    placeholder="DEL"
                    maxLength={3}
                    required
                  />
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={getAirportName(origin)}>
                    {getAirportName(origin)}
                  </span>
                </div>

                {/* Swap Icon / To Field */}
                <div className="bg-white dark:bg-gray-850 p-4 hover:bg-booking-lightblue/5 dark:hover:bg-booking-lightblue/5 transition-colors cursor-pointer group">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("to")}</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    className="w-full bg-transparent font-extrabold text-2xl text-gray-800 dark:text-white outline-none placeholder-gray-400 group-hover:text-booking-lightblue dark:group-hover:text-booking-lightblue"
                    placeholder="BOM"
                    maxLength={3}
                    required
                  />
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={getAirportName(destination)}>
                    {getAirportName(destination)}
                  </span>
                </div>

                {/* Departure Date */}
                <div className="bg-white dark:bg-gray-850 p-4 hover:bg-booking-lightblue/5 dark:hover:bg-booking-lightblue/5 transition-colors cursor-pointer">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("departure")}</span>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent font-extrabold text-lg text-gray-800 dark:text-white outline-none mt-1"
                    required
                  />
                  <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                    {date ? new Date(date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }) : t("select_date")}
                  </span>
                </div>

                {/* Return Date */}
                <div 
                  className={`bg-white dark:bg-gray-850 p-4 transition-colors cursor-pointer ${
                    tripType === "oneway" 
                      ? "opacity-60 hover:opacity-100 hover:bg-booking-lightblue/5 dark:hover:bg-booking-lightblue/5" 
                      : "hover:bg-booking-lightblue/5 dark:hover:bg-booking-lightblue/5"
                  }`}
                  onClick={() => {
                    if (tripType === "oneway") setTripType("roundtrip");
                  }}
                >
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("return")}</span>
                  {tripType === "oneway" ? (
                    <div className="mt-2 text-sm font-extrabold text-booking-lightblue uppercase">
                      + {t("add")} {t("return")}
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={returnDate}
                      min={date || today}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-lg text-gray-800 dark:text-white outline-none mt-1"
                      required={tripType === "roundtrip"}
                    />
                  )}
                  <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                    {tripType === "roundtrip" && returnDate 
                      ? new Date(returnDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }) 
                      : t("tap_roundtrip")}
                  </span>
                </div>

                {/* Travelers Info */}
                <div className="bg-white dark:bg-gray-850 p-4 hover:bg-booking-lightblue/5 dark:hover:bg-booking-lightblue/5 transition-colors cursor-pointer">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("travelers")}</span>
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
                    className="w-full bg-transparent font-extrabold text-2xl text-gray-800 dark:text-white outline-none"
                    placeholder="1"
                    required
                  />
                  <span className="block text-xs text-gray-400 dark:text-gray-505 mt-1 font-medium">
                    {t("economy_class")}
                  </span>
                </div>
              </div>

              {/* SEARCH BUTTON (Centered absolute at bottom border) */}
              <div className="flex justify-center -mb-12 mt-6 lg:mt-0">
                <button
                  type="submit"
                  data-tooltip={t("find_flights_now")}
                  className="btn-primary px-12 py-4 text-lg bg-gradient-to-r from-[#ff6636] to-[#ff3600] text-white font-extrabold rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 flex items-center justify-center gap-2 group"
                >
                  <span>{t("search_flights")}</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-200">➔</span>
                </button>
              </div>
            </form>
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
              </div>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const highlights = destinationHighlights[activeTab as keyof typeof destinationHighlights] || destinationHighlights.flights;
                return highlights.map((place: any, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => setSelectedExplorePlace(place)}
                    className="group bg-white dark:bg-gray-850 dark:border-gray-750/60 border border-gray-150 shadow-md overflow-hidden hover:shadow-xl hover:border-booking-lightblue/25 transition-all duration-300 flex flex-col h-full cursor-pointer"
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
                        <h4 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{t(place.titleKey)}</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-semibold mt-1">
                          {t(place.descKey)}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedExplorePlace(place)}
                        className="w-full text-center py-2 bg-gray-50 dark:bg-gray-750 hover:bg-booking-lightblue hover:text-white text-[10px] font-extrabold text-booking-lightblue uppercase tracking-wider transition-colors duration-250 border-t border-gray-100 dark:border-gray-700/60"
                      >
                        {t("explore_now")}
                      </button>
                    </div>
                  </div>
                ));
              })()}
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
