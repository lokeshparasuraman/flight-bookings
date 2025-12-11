import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        nav("/"); // redirect to home
      }
    }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const r = await api.post("/auth/login", { identifier, password });
      const token = r.data.token;
      setAuthToken(token);
      localStorage.setItem("token", token);
      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot", { email: identifier });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPwd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset", { email: identifier, code: resetCode, newPassword });
      setForgotMode(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  async function sendLoginOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login-otp/send", { identifier });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  const [loginCode, setLoginCode] = useState("");
  async function verifyLoginOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await api.post("/auth/login-otp/verify", { identifier, code: loginCode });
      const token = r.data?.token;
      if (token) {
        setAuthToken(token);
        localStorage.setItem("token", token);
        nav("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to verify OTP.");
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
              <div className="text-5xl mb-4">✈️</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Welcome
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to continue your journey
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 animate-slide-down">
                {error}
              </div>
            )}

            {error && error.toLowerCase().includes("migration") && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400">
                OTP login is temporarily unavailable. Please use password login.
              </div>
            )}

            {!forgotMode && !otpMode && (
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="your@email.com or +919876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
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
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-booking-lightblue"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpMode(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-booking-lightblue"
                  >
                    Login using OTP
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </form>
            )}

            {!forgotMode && otpMode && (
              <div className="space-y-6">
                <form onSubmit={sendLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email or Phone
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="your@email.com or +919876543210"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setOtpMode(false)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      Use Password Instead
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
                <form onSubmit={verifyLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter 6-digit OTP"
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                </form>
              </div>
            )}

            {forgotMode && (
              <div className="space-y-6">
                <form onSubmit={sendReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                </form>
                <form onSubmit={resetPwd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reset Code
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setForgotMode(false)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      Back to Login
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-booking-lightblue hover:text-booking-blue font-semibold transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
