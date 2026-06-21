import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  FlightIcon, 
  OfficeBuildingIcon, 
  ChartIcon,
  SecureIcon,
  ShieldIcon
} from "./Icons";

export default function Footer() {
  const { t } = useLanguage();
  const [showTerms, setShowTerms] = useState(false);
  const [showRefunds, setShowRefunds] = useState(false);
  return (
    <footer className="bg-booking-blue text-gray-300 dark:bg-gray-950 dark:text-gray-400 border-t border-gray-200/10 transition-colors duration-300">
      <div className="container max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-1 select-none group">
              <span className="text-white lowercase font-medium text-lg">fly</span>
              <span className="text-booking-lightblue lowercase font-extrabold text-lg">fast</span>
              <span className="w-1.5 h-1.5 bg-booking-lightblue inline-block"></span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {t("footer_brand_desc")}
            </p>
          </div>

          {/* Column 2: Explore services */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-white dark:text-gray-200 tracking-wider mb-4 font-display">
              {t("services")}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link to="/routes" className="hover:text-booking-lightblue transition-colors">
                  {t("available_routes")}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-booking-lightblue transition-colors">
                  {t("ai_super_search")}
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-booking-lightblue transition-colors">
                  {t("manage_reservations")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Partners */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-white dark:text-gray-200 tracking-wider mb-4 font-display">
              {t("join_business")}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link 
                  to="/airline/register" 
                  className="hover:text-booking-lightblue transition-colors flex items-center gap-1.5"
                  data-tooltip={t("tooltip_register_business")}
                >
                  <FlightIcon className="w-4 h-4 text-booking-lightblue transform -rotate-45" />
                  <span>{t("register_business")}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/airline/login" 
                  className="hover:text-booking-lightblue transition-colors flex items-center gap-1.5"
                  data-tooltip={t("tooltip_partner_login")}
                >
                  <OfficeBuildingIcon className="w-4 h-4 text-booking-lightblue" />
                  <span>{t("partner_console_login")}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/airline/dashboard" 
                  className="hover:text-booking-lightblue transition-colors flex items-center gap-1.5"
                  data-tooltip={t("tooltip_operator_dashboard")}
                >
                  <ChartIcon className="w-4 h-4 text-booking-lightblue" />
                  <span>{t("operator_dashboard")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legals & Support */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-white dark:text-gray-200 tracking-wider mb-4 font-display">
              {t("customer_support")}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li className="text-gray-400">
                {t("support_line")}: <span className="text-white font-bold">+91 98765 43210</span>
              </li>
              <li>
                <span 
                  onClick={() => setShowRefunds(true)}
                  className="cursor-pointer hover:text-booking-lightblue transition-colors"
                  data-tooltip={t("tooltip_cancellation_details")}
                >
                  {t("cancellations_refunds")}
                </span>
              </li>
              <li>
                <span 
                  onClick={() => setShowTerms(true)}
                  className="cursor-pointer hover:text-booking-lightblue transition-colors"
                  data-tooltip={t("tooltip_view_terms")}
                >
                  {t("terms_of_service")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer credit bar */}
        <div className="mt-12 pt-8 border-t border-gray-200/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <div>
            © {new Date().getFullYear()} FlyFast Inc. {t("all_rights_reserved")}
          </div>
        </div>
      </div>
      {/* Cancellations & Refunds Modal */}
      {showRefunds && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in text-gray-900 dark:text-gray-100">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-xl p-6 md:p-8 relative shadow-2xl animate-scale-in">
            <button 
              onClick={() => setShowRefunds(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-655 dark:hover:text-gray-200 font-extrabold text-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <ShieldIcon className="w-6 h-6 text-booking-lightblue" />
              <h3 className="text-xl font-extrabold font-display uppercase tracking-wider">{t("cancellations_refunds")}</h3>
            </div>
            
            <div className="space-y-4 text-xs md:text-sm text-gray-655 dark:text-gray-400 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              <p>
                {t("refunds_intro")}
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
                  <h4 className="font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wide text-xs">{t("refunds_policy_1")}</h4>
                  <p className="text-xs mt-1">
                    {t("refunds_policy_desc_1")}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-855/50 border-l-4 border-booking-lightblue">
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-xs">{t("refunds_policy_2")}</h4>
                  <p className="text-xs mt-1">
                    {t("refunds_policy_desc_2")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">{t("refunds_steps_title")}</h4>
                <ol className="list-decimal pl-4 space-y-1 text-xs">
                  <li>{t("refunds_step_1")}</li>
                  <li>{t("refunds_step_2")}</li>
                  <li>{t("refunds_step_3")}</li>
                  <li>{t("refunds_step_4")}</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button 
                onClick={() => setShowRefunds(false)}
                className="btn-primary py-2 px-6 text-xs uppercase"
              >
                {t("close_policy")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in text-gray-900 dark:text-gray-100">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-xl p-6 md:p-8 relative shadow-2xl animate-scale-in">
            <button 
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-655 dark:hover:text-gray-200 font-extrabold text-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <SecureIcon className="w-6 h-6 text-booking-lightblue" />
              <h3 className="text-xl font-extrabold font-display uppercase tracking-wider">{t("terms_of_service")}</h3>
            </div>
            
            <div className="space-y-4 text-xs md:text-sm text-gray-655 dark:text-gray-400 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              <p>
                {t("terms_intro")}
              </p>
              
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">{t("terms_section_1")}</h4>
                  <p className="mt-1">
                    {t("terms_desc_1")}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">{t("terms_section_2")}</h4>
                  <p className="mt-1">
                    {t("terms_desc_2")}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">{t("terms_section_3")}</h4>
                  <p className="mt-1">
                    {t("terms_desc_3")}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">{t("terms_section_4")}</h4>
                  <p className="mt-1">
                    {t("terms_desc_4")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button 
                onClick={() => setShowTerms(false)}
                className="btn-primary py-2 px-6 text-xs uppercase"
              >
                {t("accept_close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
