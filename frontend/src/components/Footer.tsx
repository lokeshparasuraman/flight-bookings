/**
 * Footer.tsx — Site-wide Footer
 *
 * Four-column layout on desktop, stacked on mobile.
 * Contains: brand blurb, services links, partner links, support info.
 *
 * Also houses two inline modals (not separate pages because they're
 * short policy snippets that don't warrant a full route):
 * - Cancellations & Refunds policy modal
 * - Terms of Service modal
 *
 * Both modals are triggered by clicking links in the support column.
 * They use the same animate-fade-in / animate-scale-in transitions as
 * the rest of the app for visual consistency.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FlightIcon,
  OfficeBuildingIcon,
  ChartIcon,
  SecureIcon,
  ShieldIcon
} from "./Icons";

export default function Footer() {
  
  // Controls whether the policy modals are visible
  const [showTerms, setShowTerms] = useState(false);
  const [showRefunds, setShowRefunds] = useState(false);
  return (
    <footer className="bg-booking-blue text-gray-300 dark:bg-gray-955 dark:text-gray-400 border-t border-gray-200/10 transition-colors duration-300">
      <div className="container max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* ── Main Four-Column Grid ──────────────────────────────────────────────
            Stacks to single column on mobile, 2 cols on tablet, 4 on desktop.
            gap-8 on mobile grows to gap-12 on desktop for breathing room.   */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* ── Column 1: Brand Info ─────────────────────────────────────────
              Logo + one-liner description of what FlyFast is about.         */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-1 select-none group">
              <span className="text-white lowercase font-medium text-lg">fly</span>
              <span className="text-booking-lightblue lowercase font-extrabold text-lg">fast</span>
              <span className="w-1.5 h-1.5 bg-booking-lightblue inline-block"></span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              FlyFast is a next-generation AI-powered booking platform providing instantaneous flight comparison, smart seating, and premium customer service options.
            </p>
          </div>

          {/* ── Column 2: Service Links ──────────────────────────────────────
              Quick links to the main passenger-facing features.              */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-white dark:text-gray-200 tracking-wider mb-4 font-display">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link to="/routes" className="hover:text-booking-lightblue transition-colors">
                  Available Routes
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-booking-lightblue transition-colors">
                  AI Super Search
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-booking-lightblue transition-colors">
                  Manage Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 3: Partner / Corporate Links ────────────────────────
              Links for airlines and operators who want to join the platform. */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-white dark:text-gray-200 tracking-wider mb-4 font-display">
              Join the Business
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link
                  to="/airline/register"
                  className="hover:text-booking-lightblue transition-colors flex items-center gap-1.5"
                  data-tooltip="Onboard a new travel business brand"
                >
                  <FlightIcon className="w-4 h-4 text-booking-lightblue transform -rotate-45" />
                  <span>Register Business</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/airline/login"
                  className="hover:text-booking-lightblue transition-colors flex items-center gap-1.5"
                  data-tooltip="Log in to the corporate operator panel"
                >
                  <OfficeBuildingIcon className="w-4 h-4 text-booking-lightblue" />
                  <span>Partner Console Login</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/airline/dashboard"
                  className="hover:text-booking-lightblue transition-colors flex items-center gap-1.5"
                  data-tooltip="Open partner listing dashboard"
                >
                  <ChartIcon className="w-4 h-4 text-booking-lightblue" />
                  <span>Operator Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Column 4: Support & Legal ──────────────────────────────────
              Phone number + clickable links that open inline policy modals.  */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-white dark:text-gray-200 tracking-wider mb-4 font-display">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li className="text-gray-400">
                Support Line: <span className="text-white font-bold">+91 98765 43210</span>
              </li>
              <li>
                <span
                  onClick={() => setShowRefunds(true)}
                  className="cursor-pointer hover:text-booking-lightblue transition-colors"
                  data-tooltip="Read cancellation details & timelines"
                >
                  Cancellations & Refunds
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowTerms(true)}
                  className="cursor-pointer hover:text-booking-lightblue transition-colors"
                  data-tooltip="View site usage terms & rules"
                >
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Newsletter & Social ────────────────────────────────────────────
            This is a high-conversion section: email capture for price alerts
            + social proof via links. Every major travel platform has this.   */}
        <div className="mt-10 pt-8 border-t border-gray-200/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Newsletter CTA */}
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-1">
                ✉️ Get Exclusive Deals
              </h4>
              <p className="text-xs text-gray-400 mb-3 font-medium">
                Subscribe for price alerts, flash sales &amp; travel tips — no spam.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem("email") as HTMLInputElement);
                  if (input?.value) {
                    input.value = "";
                    // Show a simple confirmation inline
                    const btn = e.currentTarget.querySelector("button");
                    if (btn) { btn.textContent = "✓ Subscribed!"; setTimeout(() => { if (btn) btn.textContent = "Subscribe"; }, 2500); }
                  }
                }}
                className="flex gap-2 max-w-sm"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs font-semibold focus:outline-none focus:border-booking-lightblue rounded-xl transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-booking-lightblue hover:brightness-105 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex flex-col gap-3 md:items-end">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Follow Us</p>
              <div className="flex items-center gap-3">
                {/* X / Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on X"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on Instagram"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on LinkedIn"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch on YouTube"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust Badges + Copyright ────────────────────────────────────────
            PCI-DSS + DGCA + IATA logos signal enterprise-grade security.     */}
        <div className="mt-8 pt-6 border-t border-gray-200/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <div>
            © {new Date().getFullYear()} FlyFast Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              🔒 PCI-DSS Secure
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              ✈️ DGCA Certified
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              🌐 IATA Member
            </span>
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
              <h3 className="text-xl font-extrabold font-display uppercase tracking-wider">Cancellations & Refunds</h3>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-gray-655 dark:text-gray-400 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              <p>
                At FlyFast, we believe in a hassle-free cancellation and refund process.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
                  <h4 className="font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wide text-xs">100% Instant Refund Policy</h4>
                  <p className="text-xs mt-1">
                    Cancellations initiated through the FlyFast app within the eligibility window qualify for a 100% instant refund of the base fare.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-855/50 border-l-4 border-booking-lightblue">
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-xs">No Double Convenience Charges</h4>
                  <p className="text-xs mt-1">
                    Unlike traditional booking agents, FlyFast does not charge additional transaction fees upon ticket cancellation.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">How to request a refund:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-xs">
                  <li>Navigate to the My Bookings console in your profile menu.</li>
                  <li>Locate the active ticket you want to cancel and click the Cancel Ticket button.</li>
                  <li>Your cancellation request will be processed immediately by our automated airline integration.</li>
                  <li>Refund proceeds are instantly transferred back to your original source account (UPI, Bank Account, or Card).</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowRefunds(false)}
                className="btn-primary py-2 px-6 text-xs uppercase"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Model */}
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
              <h3 className="text-xl font-extrabold font-display uppercase tracking-wider">Terms of Service</h3>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-gray-655 dark:text-gray-400 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              <p>
                By using FlyFast, you agree to comply with and be bound by the following terms and regulations.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">1. Booking Representation</h4>
                  <p className="mt-1">
                    FlyFast acts as a real-time reservation gateway connecting passengers directly with registered airline carrier APIs. All pricing, schedules, and flight statuses are verified instantly.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">2. Seating and Meal Choices</h4>
                  <p className="mt-1">
                    Seat allocations and meal preferences submitted via our chatbot or details form are synced immediately with the airline partners. Seating upgrades may incur convenience costs based on airline rules.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">3. Partner Accounts & Dashboard</h4>
                  <p className="mt-1">
                    Airline operators are solely responsible for ensuring exact flight paths, scheduling accuracy, and fare compliance when inputting data in the operator console.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200">4. Privacy & Data Protection</h4>
                  <p className="mt-1">
                    We secure customer information, UPI credentials, and booking histories using industry-standard SSL encryption. Your data is strictly shared with active carrier operators to verify boarding lists.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="btn-primary py-2 px-6 text-xs uppercase"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
