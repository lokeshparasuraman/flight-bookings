/**
 * Register.tsx — New Passenger Account Registration
 *
 * Two-step registration flow:
 *
 * STEP 1 — Account Details Form (otpStep = false)
 *   User fills in: full name, email, phone, password
 *   On submit, the backend sends an OTP to the phone number
 *   (or immediately returns a token in some environments)
 *
 * STEP 2 — OTP Verification (otpStep = true)
 *   User enters the 6-digit code sent to their phone
 *   On success, we get a JWT token and log the user in
 *
 * DEV HELPER:
 *   In development mode (IS_DEV = true), a "Show OTP" button appears.
 *   This fetches the latest OTP from the backend's dev endpoint so
 *   developers can test registration without needing a real phone.
 *   This endpoint is disabled in production.
 */

import React, { useState} from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { EyeIcon, EyeOffIcon, SecureIcon, FlightIcon, OfficeBuildingIcon } from "../components/Icons";

export default function Register() {
  
  // Only true during local development — enables the OTP reveal helper button
  const IS_DEV = (import.meta as any).env?.DEV === true;

  // Step 1 form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Flips to true after step 1 succeeds and OTP has been sent
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Dev-only: holds the OTP value fetched from the backend dev endpoint
  const [devOtp, setDevOtp] = useState("");

 

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await api.post("/auth/register", { email, password, name, phone });
      if (r.data?.otpSent) {
        setOtpStep(true);
      } else if (r.data?.token) {
        const token = r.data.token;
        setAuthToken(token);
        localStorage.setItem("token", token);
        nav("/");
      } else {
        setError("Registration step incomplete. Please verify OTP.");
        setOtpStep(true);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    try {
      setError("");
      await api.post("/auth/send-otp", { email });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send OTP.");
    }
  }

  async function showDevOtp() {
    try {
      setError("");
      const r = await api.post("/auth/dev/otp/latest", { identifier: email, type: "PHONE" });
      setDevOtp(r.data?.code || "");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to fetch OTP.");
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const r = await api.post("/auth/verify-otp", { email, code: otpCode });
      const token = r.data?.token;
      if (token) {
        setAuthToken(token);
        localStorage.setItem("token", token);
        nav("/");
      } else {
        setError("OTP verification failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center flex flex-col text-gray-900 dark:text-gray-100"
      style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
    >
      {/* Dark overlay for text contrast on the hero background image */}
      <div className="absolute inset-0 bg-[#18181b]/50 dark:bg-[#09090b]/80 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          {/* Card: p-6 on tiny phones, p-8 on small, p-10 on medium+
              Matches the Login page padding so both feel consistent.         */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 md:p-10 animate-scale-in">
            <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Join FlyFast and start your journey
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 animate-slide-down">
                {error}
              </div>
            )}

            {!otpStep && (
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">We will send an OTP to this number.</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 dark:text-gray-500 dark:hover:text-gray-305 flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            )}

            {otpStep && (
              <form onSubmit={verifyOtp} className="space-y-6">
                <div className="text-center mb-2">
                  <SecureIcon className="w-10 h-10 text-booking-lightblue mx-auto mb-2" />
                  <div className="font-semibold">Verify OTP</div>
                  <div className="text-sm text-gray-655 dark:text-gray-400">We have sent an OTP code to your registered mobile number</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter OTP Code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      "VERIFY OTP ➔"
                    )}
                  </button>
                </div>
                {IS_DEV && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={showDevOtp}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Show OTP (dev)
                      </button>
                      {devOtp && (
                        <div className="text-sm text-gray-700 dark:text-gray-300">Current OTP: <span className="font-mono font-semibold">{devOtp}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs space-y-3 font-semibold text-gray-500">
              <div className="flex items-center justify-center gap-1.5">
                <FlightIcon className="w-4 h-4 text-booking-lightblue transform -rotate-45" />
                <span>Already have an account?</span>
                <Link
                  to="/login"
                  className="text-booking-lightblue hover:underline"
                >
                  Login here
                </Link>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <OfficeBuildingIcon className="w-4 h-4 text-booking-lightblue" />
                <span>Carrier operator?</span>
                <Link to="/airline/register" className="text-booking-lightblue hover:underline">
                  Register carrier account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
