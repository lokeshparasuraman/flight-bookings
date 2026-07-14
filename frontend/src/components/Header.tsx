/**
 * Header.tsx — Global Navigation Bar
 *
 * The header is sticky (stays at top while scrolling) and handles:
 * - Brand logo with link back to home
 * - Desktop nav: routes, theme toggle, wishlist, language switcher, login/profile dropdown
 * - Mobile nav: hamburger menu that expands below the header bar
 * - Wishlist slide-out drawer panel
 *
 * WISHLIST SYSTEM:
 * Wishlist items are stored in localStorage as a JSON array under the key "wishlist".
 * We listen to both the native "storage" event (for cross-tab sync) and our custom
 * "wishlistUpdated" event (for same-tab updates from FlightCard). This way the count
 * badge in the header always stays up to date without needing a global state manager.
 *
 * DROPDOWN BEHAVIOUR:
 * Only one dropdown can be open at a time (tracked by activeDropdown state).
 * We close all dropdowns when the user clicks anywhere outside by listening to
 * window click. Dropdowns themselves stop propagation with e.stopPropagation()
 * so clicking inside them doesn't trigger the outside-click close.
 *
 * ENVIRONMENT CHECK:
 * In production with a missing VITE_API_URL, we show a warning banner at the top.
 * This helps developers notice misconfigured deployments immediately.
 */

import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import api from "../services/api";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  FlightIcon,
  TicketIcon,
  OfficeBuildingIcon,
  HeartIcon
} from "./Icons";

// These environment checks let us show a helpful warning banner in production
// if someone deployed without setting up VITE_API_URL correctly
const IS_DEV = (import.meta as any).env?.DEV === true;
const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || "";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Track scroll position — changes header visual style beyond 20px scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Read auth tokens on every render — if the user logs in/out in another tab
  // the header will reflect it correctly on their next interaction
  const token = localStorage.getItem("token");
  const airlineName = localStorage.getItem("airlineName");

  // Account deletion states
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const isPartner = !!airlineName;
      const endpoint = isPartner ? "/airline/me" : "/auth/me";
      await api.delete(endpoint);
      showToast("success", "Your account has been deleted successfully.");
      
      // Clear localStorage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("airlineName");
      setConfirmDeleteOpen(false);
      navigate("/");
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Failed to delete account. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  };

  // Controls whether the mobile hamburger menu is expanded
  const [menuOpen, setMenuOpen] = useState(false);

  // Tracks which desktop dropdown is currently open — null means all closed
  const [activeDropdown, setActiveDropdown] = useState<"login" | "profile" | "lang" | null>(null);

  // Wishlist drawer open/close state
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // The actual wishlist items loaded from localStorage
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // Pull wishlist from localStorage and update state
  // Wrapped in try/catch because JSON.parse can blow up on corrupted data
  const loadWishlist = () => {
    try {
      const items = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistItems(items);
    } catch (e) {
      // Corrupted wishlist data — reset to empty rather than crashing
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    // Load wishlist on mount
    loadWishlist();

    // "storage" fires when localStorage changes in ANOTHER browser tab
    // "wishlistUpdated" is our custom event for changes in the SAME tab
    // (dispatched from FlightCard when user adds/removes from wishlist)
    const handleStorage = () => loadWishlist();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("wishlistUpdated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("wishlistUpdated", handleStorage);
    };
  }, []);

  useEffect(() => {
    // Close any open dropdown when the user clicks anywhere outside
    // Dropdown buttons use e.stopPropagation() to prevent this from firing
    // when they themselves are clicked
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Clear both the user token and the airline token on logout
  // then redirect home — the Header will re-render with the logged-out state
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("airlineName");
    navigate("/");
  };

  return (
    <>
      {/* ── Missing API URL warning banner ─────────────────────────────────
          This only shows in production when VITE_API_URL wasn't set.
          It's a common deployment gotcha, so the banner helps devs spot it
          immediately without digging through the network tab.               */}
      {!IS_DEV && !VITE_API_URL && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 px-4 text-xs font-semibold shadow-inner animate-fade-in relative z-50">
          ⚠️ Environment Variable <code className="bg-black/20 px-1 py-0.5 rounded font-mono">VITE_API_URL</code> is missing!
          Please configure it in Vercel settings pointing to your Render backend API (e.g. <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono">https://your-backend.onrender.com/api</code>) to make the live application work.
        </div>
      )}

      {/* ── Main Header Bar ──────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-3xl bg-white/95 dark:bg-gray-950/95 shadow-lg shadow-black/5 border-b border-gray-200/60 dark:border-gray-800/60"
          : "glass-panel backdrop-blur-3xl bg-white/60 dark:bg-gray-900/60 border-b border-white/50 dark:border-white/10"
      }`}>
        <div className="container">
          {/* min-w-0 prevents flex children from overflowing on very small phones */}
          <div className="flex items-center justify-between h-16 md:h-20 min-w-0">
            {/* ── Brand Logo ────────────────────────────────────────────────
              The dot after "flyfast" is our brand punctuation — it signals
              precision. shrink-0 prevents it from getting squished on mobile. */}
            <Link
              to="/"
              className="flex items-center space-x-1 select-none group shrink-0"
            >
              <div className="flex items-center space-x-1 font-display text-xl md:text-2xl tracking-tight">
                <span className="text-gray-900 dark:text-white lowercase font-medium transition-colors">fly</span>
                <span className="text-booking-lightblue lowercase font-extrabold transition-colors">fast</span>
                <span className="w-1.5 h-1.5 bg-booking-lightblue inline-block"></span>
              </div>
            </Link>

            {/* ── Desktop Navigation (hidden on mobile, shown md+) ─────────── */}
            <nav className="hidden md:flex items-center space-x-4 md:space-x-6">
              <Link
                to="/routes"
                className="text-gray-700 dark:text-gray-300 hover:text-booking-lightblue dark:hover:text-booking-lightblue font-medium transition-colors duration-200"
              >
                Available Routes
              </Link>
              {token && airlineName && (
                <Link
                  to="/airline/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-booking-lightblue dark:hover:text-booking-lightblue font-medium transition-colors duration-200 text-sm"
                >
                  {(() => {
                    const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
                    const partnerCategory = categoryMatch ? categoryMatch[1] : "Airline";
                    const categoryNames: Record<string, string> = {
                      airline: "Airline",
                      hotel: "Hotel",
                      villa: "Villa",
                      bus: "Bus",
                      cruise: "Cruise",
                      cab: "Cab",
                      train: "Train",
                      holidays: "Holidays",
                      tours: "Tours",
                      visa: "Visa",
                      forex: "Forex",
                      insurance: "Insurance"
                    };
                    const catName = categoryNames[partnerCategory.toLowerCase()] || partnerCategory;
                    return `${catName} Console`;
                  })()}
                </Link>
              )}

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/40 dark:border-gray-700/60 transition-all duration-200 focus:outline-none flex items-center justify-center"
                aria-label="Toggle theme"
                data-tooltip-bottom={theme === 'dark' ? "Light Mode" : "Dark Mode"}
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
                aria-label="My Wishlist"
                data-tooltip-bottom="Wishlist"
              >
                <HeartIcon className="w-5 h-5 text-red-500 fill-current animate-pulse" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-650 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                    {wishlistItems.length}
                  </span>
                )}
              </button>



              {!token ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "login" ? null : "login"); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-booking-lightblue to-booking-blue hover:brightness-105 text-white font-extrabold text-xs transition-all duration-200 shadow-md focus:outline-none"
                    data-tooltip-bottom="User Options"
                  >
                    <UserIcon className="w-4 h-4 text-white" />
                    <span>LOGIN / SIGNUP</span>
                    <span className={`inline-block text-[9px] opacity-75 transition-transform duration-205 ${activeDropdown === "login" ? "rotate-180" : "rotate-0"}`}>▼</span>
                  </button>
                  {/* Dropdown Menu Popup */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-200 origin-top-right z-50 ${activeDropdown === "login"
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
                        <h4 className="font-extrabold text-xs uppercase tracking-wider">Welcome</h4>
                        <p className="text-[10px] text-gray-300 font-semibold mt-0.5">Unlock rewards, discounts & bookings</p>
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
                          <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Passenger Login</span>
                          <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">Book domestic & international flights</span>
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
                          <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Create Account</span>
                          <span className="block text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">Sign up for 10% App-only discount</span>
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
                          <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Join the Business</span>
                          <span className="block text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">Register Hotels, Flights, Buses, Cruises & more to grow with us.</span>
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
                    <span>{airlineName ? "PARTNER PORTAL" : "MY ACCOUNT"}</span>
                    <span className={`inline-block text-[9px] opacity-75 transition-transform duration-205 ${activeDropdown === "profile" ? "rotate-180" : "rotate-0"}`}>▼</span>
                  </button>

                  {/* Dropdown Menu Popup */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-200 origin-top-right z-50 ${activeDropdown === "profile"
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
                            if (!airlineName) return "Welcome Traveler";
                            const categoryMatch = airlineName.match(/^\[(.*?)\] (.*)$/);
                            return categoryMatch ? categoryMatch[2] : airlineName;
                          })()}
                        </h4>
                        <p className="text-[10px] text-gray-300 font-semibold mt-0.5">Logged in & secured</p>
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
                                  return partnerCategory === "Airline" ? "Airline Console" : `${partnerCategory} Console`;
                                })()}
                              </span>
                              <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">Manage console & dashboard</span>
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
                              <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">My Bookings</span>
                              <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">Manage your flight reservations</span>
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
                              <span className="block text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Book Flights</span>
                              <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">Search new destinations</span>
                            </div>
                          </Link>
                        </>
                      )}

                      {/* Delete Account */}
                      <button
                        onClick={() => { setActiveDropdown(null); setConfirmDeleteOpen(true); }}
                        className="w-full flex items-center gap-3 p-3.5 bg-red-650/5 dark:bg-red-955/10 hover:bg-red-650/10 transition-colors text-left border border-red-500/5 hover:border-red-500/10"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-400 font-extrabold text-xs flex items-center justify-center">
                          ✕
                        </div>
                        <div>
                          <span className="block text-xs font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider">Delete Account</span>
                          <span className="block text-[10px] text-gray-400 dark:text-gray-555 font-semibold mt-0.5">Permanently close account</span>
                        </div>
                      </button>

                      {/* Logout */}
                      <button
                        onClick={() => { setActiveDropdown(null); handleLogout(); }}
                        className="w-full flex items-center gap-3 p-3.5 bg-red-650/10 dark:bg-red-955/20 hover:bg-red-650/20 transition-colors text-left border border-red-500/10"
                      >
                        <div className="p-2 bg-red-650 text-white font-extrabold text-xs">
                          ➔
                        </div>
                        <div>
                          <span className="block text-xs font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider">Sign Out</span>
                          <span className="block text-[10px] text-gray-400 dark:text-gray-505 font-semibold mt-0.5">Logout from this device</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* ── Mobile Controls (visible only on < md screens) ────────────
              Kept minimal: just the theme toggle and the hamburger button.
              Everything else goes into the expanded mobile menu below.     */}
            <div className="md:hidden flex items-center space-x-1.5 shrink-0">
              {/* Theme toggle — same as desktop, just smaller on mobile */}
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

              {/* Hamburger toggle — opens/closes the mobile nav panel */}
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
          {/* ── Mobile Expanded Menu ──────────────────────────────────────────
            Slides in below the header bar when hamburger is tapped.
            Contains all the nav items that live in the desktop nav.        */}
          {menuOpen && (
            <div className="md:hidden py-3">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/routes"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                >
                  <FlightIcon className="w-5 h-5 text-booking-lightblue transform -rotate-45" />
                  <span>Available Routes</span>
                </Link>
                {!airlineName && (
                  <Link
                    to="/airline/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                  >
                    <OfficeBuildingIcon className="w-5 h-5 text-booking-lightblue" />
                    <span>Join the Business</span>
                  </Link>
                )}
                {token && !airlineName && (
                  <Link
                    to="/bookings"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                  >
                    <TicketIcon className="w-5 h-5 text-booking-lightblue" />
                    <span>My Bookings</span>
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
                      const categoryNames: Record<string, string> = {
                        airline: "Airline",
                        hotel: "Hotel",
                        villa: "Villa",
                        bus: "Bus",
                        cruise: "Cruise",
                        cab: "Cab",
                        train: "Train",
                        holidays: "Holidays",
                        tours: "Tours",
                        visa: "Visa",
                        forex: "Forex",
                        insurance: "Insurance"
                      };
                      const catName = categoryNames[partnerCategory.toLowerCase()] || partnerCategory;
                      return `${catName} Console`;
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
                    <span>My Wishlist</span>
                  </div>
                  {wishlistItems.length > 0 && (
                    <span className="bg-red-650 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>



                {!token && (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-gray-150/40 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 flex items-center gap-3 font-semibold text-sm"
                  >
                    <UserIcon className="w-5 h-5 text-booking-lightblue" />
                    <span>Passenger Login</span>
                  </Link>
                )}
                {!token && (
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-booking-lightblue text-white flex items-center gap-3 font-semibold text-sm"
                  >
                    <UserIcon className="w-5 h-5 text-white" />
                    <span>Create Account</span>
                  </Link>
                )}
                {token && (
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center gap-3 font-semibold text-sm"
                  >
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Wishlist Slide-out Drawer ───────────────────────────────────────────
        Full-screen overlay with a semi-transparent backdrop.
        The actual panel slides in from the right (animate-slide-left in CSS).
        max-w-md keeps it from being too wide on large desktop screens.       */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Semi-transparent backdrop — clicking it closes the drawer */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity animate-fade-in"
            onClick={() => setWishlistOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md glass-panel flex flex-col h-full border-l border-white/50 dark:border-gray-700/50 animate-slide-left shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 text-red-500 fill-current animate-pulse" />
                  <h3 className="text-lg font-extrabold text-gray-855 dark:text-white uppercase tracking-wider">My Wishlist</h3>
                </div>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 text-2xl font-bold transition-colors focus:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <HeartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-sm font-semibold text-gray-455 dark:text-gray-500">Your wishlist is empty.</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const flights = wishlistItems.filter((x: any) => !!x.basePriceCents);
                      const routes = wishlistItems.filter((x: any) => x.origin && x.destination && !x.basePriceCents);
                      const places = wishlistItems.filter((x: any) => x.title && x.type);

                      const handleRemove = (item: any) => {
                        const updated = wishlistItems.filter((x: any) => {
                          if (item.type && x.type) return x.id !== item.id && x.title !== item.title;
                          return (x.id || `${x.origin}-${x.destination}`) !== (item.id || `${item.origin}-${item.destination}`);
                        });
                        localStorage.setItem("wishlist", JSON.stringify(updated));
                        setWishlistItems(updated);
                        window.dispatchEvent(new Event("wishlistUpdated"));
                      };

                      return (
                        <div className="space-y-8">
                          {flights.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold text-booking-lightblue uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-2">Saved Flights</h4>
                              {flights.map((item: any) => {
                                const priceVal = (item.basePriceCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                                return (
                                  <div key={item.id} className="p-4 border border-gray-150 dark:border-gray-800 rounded-2xl bg-white/40 dark:bg-gray-850/30 hover:border-booking-lightblue/30 transition-all flex justify-between items-center gap-4 relative group backdrop-blur-md shadow-sm hover:shadow-md">
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
                                        {`${new Date(item.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${new Date(item.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end justify-between h-full gap-3">
                                      <div>
                                        <span className="text-[9px] text-gray-400 block font-medium uppercase tracking-wider">Fare from</span>
                                        <span className="text-sm font-extrabold text-booking-lightblue">₹{priceVal}</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 border border-red-500/10 transition-colors uppercase font-bold tracking-wider rounded-lg" title="Remove">✕</button>
                                        <Link to={`/flight/${item.id}`} onClick={() => setWishlistOpen(false)} className="px-3 py-1.5 text-xs bg-booking-lightblue text-white font-extrabold hover:brightness-105 transition-all text-center tracking-wider rounded-lg shadow-md">➔</Link>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {routes.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold text-booking-lightblue uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-2">Saved Routes</h4>
                              {routes.map((item: any) => (
                                <div key={`${item.origin}-${item.destination}`} className="p-4 border border-gray-150 dark:border-gray-800 rounded-2xl bg-white/40 dark:bg-gray-850/30 hover:border-booking-lightblue/30 transition-all flex justify-between items-center gap-4 relative group backdrop-blur-md shadow-sm hover:shadow-md">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-extrabold text-booking-lightblue uppercase tracking-wider">Route</span>
                                      <span className="text-[10px] text-gray-455 dark:text-gray-500 font-semibold">Direct</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-sm font-extrabold text-gray-800 dark:text-gray-200">{item.origin}</div>
                                      <span className="text-gray-300 text-xs">➔</span>
                                      <div className="text-sm font-extrabold text-gray-800 dark:text-gray-200">{item.destination}</div>
                                    </div>
                                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">Daily Flights</div>
                                  </div>
                                  <div className="text-right flex flex-col items-end justify-between h-full gap-3">
                                    <div>
                                      <span className="text-[9px] text-gray-400 block font-medium uppercase tracking-wider">Available</span>
                                      <span className="text-sm font-extrabold text-booking-lightblue">View Details</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 border border-red-500/10 transition-colors uppercase font-bold tracking-wider rounded-lg" title="Remove">✕</button>
                                      <Link to={`/search?origin=${item.origin}&destination=${item.destination}`} onClick={() => setWishlistOpen(false)} className="px-3 py-1.5 text-xs bg-booking-lightblue text-white font-extrabold hover:brightness-105 transition-all text-center tracking-wider rounded-lg shadow-md">➔</Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {places.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold text-booking-lightblue uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-2">Saved Places</h4>
                              {places.map((item: any) => (
                                <div key={`${item.id}-${item.title}`} className="p-4 border border-gray-150 dark:border-gray-800 rounded-2xl bg-white/40 dark:bg-gray-850/30 hover:border-booking-lightblue/30 transition-all flex justify-between items-center gap-4 relative group backdrop-blur-md shadow-sm hover:shadow-md">
                                  {item.img && (
                                    <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-200 dark:border-gray-700">
                                      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-extrabold text-booking-lightblue uppercase tracking-wider">{item.type}</span>
                                    </div>
                                    <div className="text-sm font-extrabold text-gray-800 dark:text-gray-200 leading-tight">{item.title}</div>
                                    {item.state && <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{item.state}</div>}
                                  </div>
                                  <div className="text-right flex flex-col items-end justify-between h-full gap-3">
                                    {item.price ? (
                                      <div>
                                        <span className="text-sm font-extrabold text-[#ff6636] block">{item.price}</span>
                                      </div>
                                    ) : <div />}
                                    <div className="flex gap-2">
                                      <button onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 border border-red-500/10 transition-colors uppercase font-bold tracking-wider rounded-lg" title="Remove">✕</button>
                                      <Link to="/" onClick={() => setWishlistOpen(false)} className="px-3 py-1.5 text-xs bg-booking-lightblue text-white font-extrabold hover:brightness-105 transition-all text-center tracking-wider rounded-lg shadow-md">➔</Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4">
            <div className="w-12 h-12 bg-red-105 dark:bg-red-955/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-855 dark:text-white">Delete Account?</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Are you sure you want to permanently delete your account? All active {airlineName ? "listings and reservations" : "flight bookings"} will be permanently cancelled. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="w-full sm:flex-1 px-4 py-2.5 border border-gray-250 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAccount}
                onClick={confirmDeleteAccount}
                className="w-full sm:flex-1 bg-red-600 hover:bg-red-750 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
              >
                {deletingAccount ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
