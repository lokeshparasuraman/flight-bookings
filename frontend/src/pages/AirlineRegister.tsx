import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Footer from "../components/Footer";
import { OfficeBuildingIcon, TicketIcon } from "../components/Icons";

export default function AirlineRegister() {
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Airline");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast("warning", "Please fill in all registration fields");
      return;
    }
    if (password.length < 6) {
      showToast("warning", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const prefixedName = `[${category}] ${name}`;
      const response = await api.post("/airline/register", { name: prefixedName, email, password });
      const { token, airline } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("airlineName", airline.name);

      showToast("success", `Partner account created! Welcome ${name}`);
      navigate("/airline/dashboard");
    } catch (err: any) {
      showToast("error", err?.response?.data?.error || "Registration failed. Brand or email may be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center flex flex-col text-gray-900 dark:text-gray-100"
      style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[#18181b]/50 dark:bg-[#09090b]/80 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-scale-in">
            <div className="text-center mb-8">
              <OfficeBuildingIcon className="w-16 h-16 text-booking-lightblue mx-auto mb-2" />
            <h1 className="text-2xl font-extrabold text-gray-855 dark:text-white">
              Partner Onboarding
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-505 mt-1 font-semibold uppercase tracking-wider">
              Grow your business with FlyFast
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Business Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field text-sm py-3 font-semibold"
              >
                <option value="Airline">Flight Carrier (Airline)</option>
                <option value="Hotel">Hotel Owner</option>
                <option value="Villa">Villa / Homestay Host</option>
                <option value="Bus">Bus Operator</option>
                <option value="Cruise">Cruise Provider</option>
                <option value="Cab">Cab Provider / Agency</option>
                <option value="Train">Train Operator</option>
                <option value="Holidays">Holiday Packages Provider</option>
                <option value="Tours">Tours & Attractions</option>
                <option value="Visa">Visa Agency</option>
                <option value="Forex">Forex Provider</option>
                <option value="Insurance">Travel Insurance Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Business / Brand Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Grand Palace, Greenline Buses..."
                className="input-field text-sm py-3"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Corporate Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="corporate@brand.com"
                className="input-field text-sm py-3"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Security Password (Min 6 chars)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field text-sm py-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-3.5 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                "CREATE PARTNER ACCOUNT ➔"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs space-y-3 font-semibold text-gray-500">
            <div className="flex items-center justify-center gap-1.5">
              <OfficeBuildingIcon className="w-4 h-4 text-booking-lightblue" />
              <span>Already registered?</span>
              <Link to="/airline/login" className="text-booking-lightblue hover:underline">
                Partner Login
              </Link>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <TicketIcon className="w-4 h-4 text-booking-lightblue" />
              <span>Traveling as a passenger?</span>
              <Link to="/register" className="text-booking-lightblue hover:underline">
                User Sign Up
              </Link>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
