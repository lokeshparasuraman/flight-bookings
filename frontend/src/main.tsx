/**
 * main.tsx — Application Entry Point
 *
 * This is where the whole React app boots up. A few key decisions made here:
 *
 * 1. LAZY LOADING: Every page component is loaded lazily with React.lazy().
 *    This means the browser only downloads the code for a page when the user
 *    actually navigates to it — much better initial load time than bundling
 *    everything together.
 *
 * 2. SUSPENSE: Wraps all lazy-loaded routes. Shows a simple loading div while
 *    the chunk is being fetched. Could be fancied up with a skeleton later.
 *
 * 3. CONTEXT NESTING ORDER:
 *    LanguageProvider (outermost) → ThemeProvider → ToastProvider → ErrorBoundary
 *    Language is outermost because literally everything else may need to display
 *    translated text, including the error boundary's error message.
 *
 * 4. ERROR BOUNDARY: A class component safety net. If any child component throws
 *    during render, this catches it and shows a friendly "Something went wrong"
 *    instead of a white screen. We log the details to console for debugging.
 */

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";

// ─── Lazy-loaded page components ─────────────────────────────────────────────
// Each of these becomes a separate JS chunk in the build output.
// The browser fetches them on-demand as the user navigates.
const Home            = lazy(() => import("./pages/Home"));
const SearchResults   = lazy(() => import("./pages/SearchResults"));
const FlightDetail    = lazy(() => import("./pages/FlightDetail"));
const Login           = lazy(() => import("./pages/Login"));
const Register        = lazy(() => import("./pages/Register"));
const Bookings        = lazy(() => import("./pages/Bookings"));
const AvailableRoutes = lazy(() => import("./pages/AvailableRoutes"));
const AirlineLogin    = lazy(() => import("./pages/AirlineLogin"));
const AirlineRegister = lazy(() => import("./pages/AirlineRegister"));
const AirlineDashboard = lazy(() => import("./pages/AirlineDashboard"));

import "./index.css";
import { ToastProvider } from "./contexts/ToastContext";

// ─── Root App component ───────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      {/* Toast notifications live here — any child can call showToast() */}
      <ToastProvider>
        {/* Catch any runtime render errors so the whole app doesn't white-screen */}
        <ErrorBoundary>
          <BrowserRouter>
            {/* Suspense fallback shows while lazy chunks are loading */}
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-booking-lightblue" />
                </div>
              }
            >
              <Routes>
                {/* Public pages */}
                <Route path="/"                   element={<Home />} />
                <Route path="/search"             element={<SearchResults />} />
                <Route path="/flight/:id"         element={<FlightDetail />} />
                <Route path="/login"              element={<Login />} />
                <Route path="/register"           element={<Register />} />
                <Route path="/routes"             element={<AvailableRoutes />} />

                {/* Authenticated passenger pages */}
                <Route path="/bookings"           element={<Bookings />} />

                {/* Airline / partner portal pages */}
                <Route path="/airline/login"      element={<AirlineLogin />} />
                <Route path="/airline/register"   element={<AirlineRegister />} />
                <Route path="/airline/dashboard"  element={<AirlineDashboard />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
// React requires this to be a class component (hooks can't catch render errors).
// getDerivedStateFromError flips the flag synchronously during the error.
// componentDidCatch runs after the render pass and is where we log the details.
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  // Flip the flag whenever a descendant throws during rendering
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Log the full error + component stack for debugging (doesn't affect the UI)
  componentDidCatch(error: any, info: any) {
    console.error("[FlyFast] Uncaught render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Keep this simple — the user just needs to know to refresh
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="text-5xl">✈️</div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We hit a snag. Please refresh the page to get back on track.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary py-2 px-6 text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}

// ─── Mount the app ────────────────────────────────────────────────────────────
// The root <div id="root"> comes from public/index.html.
// We use the non-null assertion (!) because we know it exists.
createRoot(document.getElementById("root")!).render(<App />);
