import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import FloatingAiChat from "./components/FloatingAiChat";
const Home = lazy(() => import("./pages/Home"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const FlightDetail = lazy(() => import("./pages/FlightDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Bookings = lazy(() => import("./pages/Bookings"));
const AvailableRoutes = lazy(() => import("./pages/AvailableRoutes"));
import "./index.css";

import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/flight/:id" element={<FlightDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/routes" element={<AvailableRoutes />} />
              </Routes>
            </Suspense>
            <FloatingAiChat />
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("UI error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-6 text-center">Something went wrong. Please refresh.</div>;
    }
    return this.props.children as any;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
