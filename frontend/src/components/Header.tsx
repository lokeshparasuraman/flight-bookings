import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  SunIcon, 
  MoonIcon, 
  UserIcon, 
  FlightIcon, 
  TicketIcon, 
  OfficeBuildingIcon,
  HeartIcon,
  GlobeIcon
} from "./Icons";

const IS_DEV = (import.meta as any).env?.DEV === true;
const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || "";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const airlineName = localStorage.getItem("airlineName");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"login" | "profile" | "lang" | null>(null);

  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const loadWishlist = () => {
    try {
      const items = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistItems(items);
    } catch (e) {
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    loadWishlist();
    const handleStorage = () => loadWishlist();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("wishlistUpdated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("wishlistUpdated", handleStorage);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("airlineName");
    navigate("/");
  };

  return (
    <>
      {!IS_DEV && !VITE_API_URL && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 px-4 text-xs font-semibold shadow-inner animate-fade-in relative z-50">
          ⚠️ Environment Variable <code className="bg-black/20 px-1 py-0.5 rounded font-mono">VITE_API_URL</code> is missing! 
          Please configure it in Vercel settings pointing to your Render backend API (e.g. <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono">https://your-backend.onrender.com/api</code>) to make the live application work.
        </div>
      )}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-1 select-none group"
          >
            <div className="flex items-center space-x-1 font-display text-xl md:text-2xl tracking-tight">
              <span className="text-gray-900 dark:text-white lowercase font-medium transition-colors">fly</span>
              <span className="text-booking-lightblue lowercase font-extrabold transition-colors">fast</span>
              <span className="w-1.5 h-1.5 bg-booking-lightblue inline-block"></span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-4 md:space-x-6">
            <Link
              to="/routes"
              className="text-gray-700 dark:text-gray-300 hover:text-booking-lightblue dark:hover:text-booking-lightblue font-medium transition-colors duration-200"
            >
              {t("available_routes")}
            </Link>
            {token && airlineName && (
              <Link
                to="/airline/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-booking-lightblue dark:hover:text-booking-lightblue font-medium transition-colors duration-200 text-sm"
              >
                {(() => {
                  const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
                  const partnerCategory = categoryMatch ? categoryMatch[1] : "Airline";
                  const catKey = `category_${partnerCategory.toLowerCase()}`;
                  return `${t(catKey)} ${t("console")}`;
                })()}
              </Link>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/40 dark:border-gray-700/60 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label="Toggle theme"
              data-tooltip-bottom={theme === 'dark' ? t("light_mode") : t("dark_mode")}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-amber-500 animate-spin-slow" />
              ) : (
                <MoonIcon className="w-5 h-5 text-booking-blue" />
              )}
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={() => { loadWishlist(); setWishlistOpen(true); }}
              className="relative p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/40 dark:border-gray-700/60 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label={t("my_wishlist")}
              data-tooltip-bottom={t("wishlist")}
            >
              <HeartIcon className="w-5 h-5 text-red-500 fill-current animate-pulse" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-650 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "lang" ? null : "lang"); }}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/40 dark:border-gray-700/60 transition-all duration-200 focus:outline-none flex items-center justify-center gap-1.5 text-xs font-extrabold"
                aria-label="Change Language"
                data-tooltip-bottom={t("select_language")}
              >
                <GlobeIcon className="w-5 h-5 text-booking-lightblue" />
                <span className="uppercase text-[9px]">{language}</span>
              </button>
              
              {activeDropdown === "lang" && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-855 shadow-xl z-50 p-1 space-y-0.5"
                >
                  {(["en", "ta"] as const).map((lang) => {
                    const names = { en: "English", ta: "தமிழ்" };
                    return (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setActiveDropdown(null); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                          language === lang ? "text-booking-lightblue bg-booking-lightblue/5" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span>{names[lang]}</span>
                        {language === lang && <span className="text-booking-lightblue">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {!token ? (
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "login" ? null : "login"); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-booking-lightblue to-booking-blue hover:brightness-105 text-white font-extrabold text-xs transition-all duration-200 shadow-md focus:outline-none"
                  data-tooltip-bottom={t("user_options")}
                >
                  <UserIcon className="w-4 h-4 text-white" />
                  <span>{t("login_signup")}</span>
                  <span className={`inline-block text-[9px] opacity-75 transition-transform duration-205 ${activeDropdown === "login" ? "rotate-180" : "rotate-0"}`}>▼</span>
                </button>
                {/* Dropdown Menu Popup */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-200 origin-top-right z-50 ${
                    activeDropdown === "login" 
                      ? "scale-100 opacity-100 pointer-events-auto" 
                      : "scale-95 opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Background overlay */}
                  <div 
                    className="relative bg-cover bg-center p-4 border-b border-gray-150 dark:border-gray-855"
                    style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
                  >
                    <div className="absolute inset-0 bg-[#334155]/75 dark:bg-gray-955/80 z-0"></div>
                    <div className="relative z-10 text-white text-left">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider">{t("welcome")}</h4>
                      <p className="text-[10px] text-gray-300 font-semibold mt-0.5">{t("welcome_desc")}</p>
                    </div>
                  </div>
                  
                  <div className="p-2.5 space-y-2">
                    {/* Passenger Login */}
                    <Link 
                      to="/login"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-850/60 hover:bg-booking-lightblue/10 dark:hover:bg-booking-lightblue/10 border border-gray-150 dark:border-gray-800 transition-all duration-200 text-left"
                    >
                      <div className="p-2 bg-booking-lightblue/15 text-booking-lightblue">
                        <FlightIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{t("passenger_login")}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">{t("passenger_login_desc")}</span>
                      </div>
                    </Link>

                    {/* Passenger Signup */}
                    <Link 
                      to="/register"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-850/60 hover:bg-booking-lightblue/10 dark:hover:bg-booking-lightblue/10 border border-gray-150 dark:border-gray-800 transition-all duration-200 text-left"
                    >
                      <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{t("create_account")}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">{t("create_account_desc")}</span>
                      </div>
                    </Link>
                    
                    {/* Partner Onboarding - Join the Business */}
                    <Link 
                      to="/airline/login"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-850/60 hover:bg-booking-lightblue/10 dark:hover:bg-booking-lightblue/10 border border-gray-150 dark:border-gray-800 transition-all duration-200 text-left"
                    >
                      <div className="p-2 bg-amber-500/10 text-amber-500">
                        <OfficeBuildingIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{t("join_business")}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">{t("welcome_carrier")}</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "profile" ? null : "profile"); }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-booking-lightblue text-booking-lightblue font-extrabold text-xs transition-all duration-200 hover:bg-booking-lightblue/5 focus:outline-none"
                >
                  <UserIcon className="w-4 h-4 text-booking-lightblue" />
                  <span>{airlineName ? t("partner_portal") : t("my_account")}</span>
                  <span className={`inline-block text-[9px] opacity-75 transition-transform duration-205 ${activeDropdown === "profile" ? "rotate-180" : "rotate-0"}`}>▼</span>
                </button>
                
                {/* Dropdown Menu Popup */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-200 origin-top-right z-50 ${
                    activeDropdown === "profile" 
                      ? "scale-100 opacity-100 pointer-events-auto" 
                      : "scale-95 opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Background overlay */}
                  <div 
                    className="relative bg-cover bg-center p-4 border-b border-gray-150 dark:border-gray-850"
                    style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
                  >
                    <div className="absolute inset-0 bg-[#18181b]/70 dark:bg-[#09090b]/80 z-0"></div>
                    <div className="relative z-10 text-white text-left">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider truncate">
                        {(() => {
                          if (!airlineName) return t("welcome_traveler");
                          const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
                          return categoryMatch ? categoryMatch[2] : airlineName;
                        })()}
                      </h4>
                      <p className="text-[10px] text-gray-300 font-semibold mt-0.5">{t("logged_in_secured")}</p>
                    </div>
                  </div>
                  
                  <div className="p-2.5 space-y-2">
                    {airlineName ? (
                      <>
                        {/* Partner Dashboard */}
                        <Link 
                          to="/airline/dashboard"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-850/60 hover:bg-booking-lightblue/10 dark:hover:bg-booking-lightblue/10 border border-gray-150 dark:border-gray-800 transition-all duration-200 text-left"
                        >
                          <div className="p-2 bg-booking-lightblue/15 text-booking-lightblue">
                            <OfficeBuildingIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
                              {(() => {
                                const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
                                const partnerCategory = categoryMatch ? categoryMatch[1] : "Airline";
                                return partnerCategory === "Airline" ? t("dashboard") : `${partnerCategory} Console`;
                              })()}
                            </span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">{t("manage_console_desc")}</span>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* My Bookings */}
                        <Link 
                          to="/bookings"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-850/60 hover:bg-booking-lightblue/10 dark:hover:bg-booking-lightblue/10 border border-gray-150 dark:border-gray-800 transition-all duration-200 text-left"
                        >
                          <div className="p-2 bg-booking-lightblue/15 text-booking-lightblue">
                            <TicketIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{t("my_bookings")}</span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">{t("my_bookings_desc")}</span>
                          </div>
                        </Link>

                        {/* Book Flights */}
                        <Link 
                          to="/"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-850/60 hover:bg-booking-lightblue/10 dark:hover:bg-booking-lightblue/10 border border-gray-150 dark:border-gray-800 transition-all duration-200 text-left"
                        >
                          <div className="p-2 bg-green-500/10 text-green-600 dark:text-green-400">
                            <FlightIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{t("book_flights")}</span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">{t("book_flights_desc")}</span>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    {/* Logout */}
                    <button 
                      onClick={() => { setActiveDropdown(null); handleLogout(); }}
                      className="w-full flex items-center gap-3 p-3.5 bg-red-650/10 dark:bg-red-955/20 hover:bg-red-650/20 transition-colors text-left border border-red-500/10"
                    >
                      <div className="p-2 bg-red-650 text-white font-extrabold text-xs">
                        ➔
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider">{t("sign_out_btn")}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">{t("logout_desc")}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="md:hidden flex items-center space-x-1.5">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/40 dark:border-gray-700/60 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-amber-500 animate-spin-slow" />
              ) : (
                <MoonIcon className="w-5 h-5 text-booking-blue" />
              )}
            </button>

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/40 dark:border-gray-700/60 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden py-3">
            <div className="flex flex-col space-y-2">
              <Link
                to="/routes"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
              >
                <FlightIcon className="w-5 h-5 text-booking-lightblue transform -rotate-45" />
                <span>{t("available_routes")}</span>
              </Link>
              {!airlineName && (
                <Link
                  to="/airline/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                >
                  <OfficeBuildingIcon className="w-5 h-5 text-booking-lightblue" />
                  <span>{t("join_business")}</span>
                </Link>
              )}
              {token && !airlineName && (
                <Link
                  to="/bookings"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                >
                  <TicketIcon className="w-5 h-5 text-booking-lightblue" />
                  <span>{t("my_bookings")}</span>
                </Link>
              )}
              {token && airlineName && (
                <Link
                  to="/airline/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                >
                  <OfficeBuildingIcon className="w-5 h-5 text-booking-lightblue" />
                  <span>{(() => {
                    const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
                    const partnerCategory = categoryMatch ? categoryMatch[1] : "Airline";
                    const catKey = `category_${partnerCategory.toLowerCase()}`;
                    return `${t(catKey)} ${t("console")}`;
                  })()}</span>
                </Link>
              )}

              {/* Mobile Wishlist Option */}
              <button
                onClick={() => { setMenuOpen(false); loadWishlist(); setWishlistOpen(true); }}
                className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center justify-between font-semibold text-sm w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <HeartIcon className="w-5 h-5 text-red-500 fill-current" />
                  <span>{t("my_wishlist")}</span>
                </div>
                {wishlistItems.length > 0 && (
                  <span className="bg-red-650 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Mobile Language Selection */}
              <div className="px-4 py-2 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center justify-between font-semibold text-sm">
                <div className="flex items-center gap-3">
                  <GlobeIcon className="w-5 h-5 text-booking-lightblue" />
                  <span>{t("select_language")}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setLanguage("en"); setMenuOpen(false); }}
                    className={`px-2 py-1 text-xs font-bold ${language === 'en' ? 'text-booking-lightblue underline font-extrabold' : 'text-gray-500'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage("ta"); setMenuOpen(false); }}
                    className={`px-2 py-1 text-xs font-bold ${language === 'ta' ? 'text-booking-lightblue underline font-extrabold' : 'text-gray-500'}`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {!token && (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                >
                  <UserIcon className="w-5 h-5 text-booking-lightblue" />
                  <span>{t("passenger_login")}</span>
                </Link>
              )}
              {!token && (
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-booking-lightblue text-white flex items-center gap-3 font-semibold text-sm"
                >
                  <UserIcon className="w-5 h-5 text-white" />
                  <span>{t("create_account")}</span>
                </Link>
              )}
              {token && (
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center gap-3 font-semibold text-sm"
                >
                  <span>{t("sign_out")}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Slide-out Wishlist Drawer */}
    {wishlistOpen && (
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity animate-fade-in"
          onClick={() => setWishlistOpen(false)}
        />
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full border-l border-gray-200 dark:border-gray-800 animate-slide-left">
            {/* Header */}
            <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-red-500 fill-current animate-pulse" />
                <h3 className="text-lg font-extrabold text-gray-855 dark:text-white uppercase tracking-wider">{t("my_wishlist")}</h3>
              </div>
              <button 
                onClick={() => setWishlistOpen(false)}
                className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 text-2xl font-bold transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <HeartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                  <p className="text-sm font-semibold text-gray-455 dark:text-gray-500">{t("wishlist_empty")}</p>
                </div>
              ) : (
                wishlistItems.map((item: any) => {
                  const handleRemove = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const updated = wishlistItems.filter((x: any) => x.id !== item.id);
                    localStorage.setItem("wishlist", JSON.stringify(updated));
                    setWishlistItems(updated);
                    window.dispatchEvent(new Event("wishlistUpdated"));
                  };
                  const priceVal = (item.basePriceCents / 100).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  });
                  return (
                    <div 
                      key={item.id}
                      className="p-4 border border-gray-150 dark:border-gray-800 rounded-none bg-gray-50/50 dark:bg-gray-850/30 hover:border-booking-lightblue/30 transition-all flex justify-between items-center gap-4 relative group"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-booking-lightblue uppercase tracking-wider">{item.airline}</span>
                          <span className="text-[10px] text-gray-455 dark:text-gray-500 font-semibold">{item.flightNumber}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-extrabold text-gray-800 dark:text-gray-200">{item.origin}</div>
                          <span className="text-gray-300 text-xs">➔</span>
                          <div className="text-sm font-extrabold text-gray-800 dark:text-gray-200">{item.destination}</div>
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                          {new Date(item.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(item.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end justify-between h-full gap-3">
                        <div>
                          <span className="text-[9px] text-gray-400 block font-medium uppercase tracking-wider">{t("fare_starting")}</span>
                          <span className="text-sm font-extrabold text-booking-lightblue">₹{priceVal}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRemove}
                            className="p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 border border-red-500/10 transition-colors uppercase font-bold tracking-wider"
                            title="Remove"
                          >
                            ✕
                          </button>
                          <Link
                            to={`/flight/${item.id}`}
                            onClick={() => setWishlistOpen(false)}
                            className="px-3 py-1.5 text-xs bg-booking-lightblue text-white font-extrabold hover:brightness-105 transition-all text-center tracking-wider"
                          >
                            ➔
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
