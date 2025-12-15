import React, { useState} from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";

export default function Register() {
  const IS_DEV = (import.meta as any).env?.DEV === true;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container py-12 md:py-20">
        <div className="max-w-md mx-auto animate-scale-in">
          <div className="card p-8 shadow-soft-lg">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
            )}

            {otpStep && (
              <form onSubmit={verifyOtp} className="space-y-6">
                <div className="text-center mb-2">
                  <div className="text-2xl mb-1">🔐</div>
                  <div className="font-semibold">Verify your mobile number</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Enter the OTP sent to your phone</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter 6-digit OTP"
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
                    className="btn-primary"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
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

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-booking-lightblue hover:text-booking-blue font-semibold transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
