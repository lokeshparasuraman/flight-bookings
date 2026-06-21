import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { EyeIcon, EyeOffIcon, FlightIcon, TicketIcon, OfficeBuildingIcon } from "../components/Icons";
import { useLanguage } from "../contexts/LanguageContext";

export default function Login() {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const identifierValid = (() => {
    const id = String(identifier).trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    const phoneOk = /^\+?[1-9]\d{9,14}$/.test(id);
    return emailOk || phoneOk;
  })();
  
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
      await api.post("/auth/forgot", { identifier });
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
      await api.post("/auth/reset", { identifier, code: resetCode, newPassword });
      setForgotMode(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center flex flex-col text-gray-900 dark:text-gray-100"
      style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[#0a2240]/40 dark:bg-gray-955/80 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-scale-in">
            <div>
              <div className="text-center mb-8">
                <FlightIcon className="w-16 h-16 text-booking-lightblue mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {t("welcome")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("login_subtitle")}
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

            {!forgotMode && (
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("email_or_phone")}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t("email_or_phone_placeholder")}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("password_label")}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 dark:text-gray-500 dark:hover:text-gray-305 flex items-center justify-center"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-booking-lightblue"
                  >
                    {t("forgot_password")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>{t("logging_in")}</span>
                      </>
                    ) : (
                      t("login_btn")
                    )}
                  </button>
                </div>
              </form>
            )}

            

            {forgotMode && (
              <div className="space-y-6">
                <form onSubmit={sendReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("email_or_phone")}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={t("email_or_phone_placeholder")}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                    {!identifierValid && identifier.trim() && (
                      <div className="text-xs text-red-655 dark:text-red-400 mt-2">
                        {t("invalid_identifier")}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !identifierValid}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>{t("submitting")}</span>
                      </>
                    ) : (
                      t("request_otp")
                    )}
                  </button>
                </form>
                <form onSubmit={resetPwd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("otp_code")}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={t("enter_code")}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t("new_password")}
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder={t("new_password")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setForgotMode(false)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {t("back_to_login")}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>{t("submitting")}</span>
                        </>
                      ) : (
                        t("reset_password")
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs space-y-3 font-semibold text-gray-500">
              <div className="flex items-center justify-center gap-1.5">
                <TicketIcon className="w-4 h-4 text-booking-lightblue" />
                <span>{t("no_account")}</span>
                <Link
                  to="/register"
                  className="text-booking-lightblue hover:underline"
                >
                  {t("register_here")}
                </Link>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <OfficeBuildingIcon className="w-4 h-4 text-booking-lightblue" />
                <span>{t("carrier_operator")}</span>
                <Link to="/airline/login" className="text-booking-lightblue hover:underline">
                  {t("partner_login_btn")}
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
