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

  const destinationHighlights = {
    flights: [
      { title: "Agra (Taj Mahal)", desc: "Witness the monumental symbol of eternal love.", img: "/places/taj_mahal.png", price: "₹2,499" },
      { title: "Goa Beaches", desc: "Soak in the sun at India's favorite beach paradise.", img: "/places/goa_beach.png", price: "₹3,199" },
      { title: "Kerala Backwaters", desc: "Unwind on a peaceful houseboat cruise through nature.", img: "/places/kerala_houseboat.png", price: "₹4,299" }
    ],
    hotels: [
      { title: "Taj Lake Palace, Udaipur", desc: "Experience royal luxury floating on serene waters.", img: "/places/lake_palace.png", rating: "4.9 ★" },
      { title: "The Imperial, New Delhi", desc: "Colonial-style heritage hotel in the heart of Delhi.", img: "/places/lake_palace.png", rating: "4.8 ★" }
    ],
    homestays: [
      { title: "Cloud-Mist Villa, Coorg", desc: "Cozy estate cottage overlooking coffee valleys.", img: "/places/goa_beach.png", rating: "4.7 ★" }
    ],
    buses: [
      { title: "Bangalore to Ooty", desc: "Scenic overnight luxury sleeper bus routes.", img: "/places/kerala_houseboat.png", price: "₹899" }
    ],
    cruise: [
      { title: "Lakshadweep Explorer", desc: "Cruise through pristine lagoons and coral reefs.", img: "/places/lakshadweep_cruise.png", price: "₹18,500" }
    ],
    tours: [
      { title: "Ajanta & Ellora Caves", desc: "Explore ancient rock-cut Buddhist and Hindu monuments.", img: "/places/taj_mahal.png", duration: "2 Days" }
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
          <div className="absolute inset-0 bg-[#0a2240]/35 dark:bg-gray-955/70 z-0"></div>
          
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
                    className="group bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 shadow-md overflow-hidden hover:shadow-xl hover:border-booking-lightblue/25 transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Place Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <img 
                        src={place.img} 
                        alt={place.title}
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
                      {place.duration && (
                        <div className="absolute bottom-3 left-3 bg-booking-lightblue text-white text-[10px] font-extrabold px-2.5 py-1 tracking-wider uppercase">
                          {place.duration}
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-855 dark:text-white uppercase tracking-wider">{place.title}</h4>
                        <p className="text-[11px] text-gray-455 dark:text-gray-450 leading-relaxed font-semibold mt-1">
                          {place.desc}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (activeTab === "flights") {
                            const codeMatch = place.title.match(/\((.*?)\)/);
                            if (codeMatch) {
                              setDestination(codeMatch[1]);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }
                        }}
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
