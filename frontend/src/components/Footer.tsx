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

        {/* ── Bottom Bar ────────────────────────────────────────────────────
            Copyright line. Centered on mobile, space-between on desktop.    */}
        <div className="mt-12 pt-8 border-t border-gray-200/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <div>
            © {new Date().getFullYear()} FlyFast Inc. All rights reserved.
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
