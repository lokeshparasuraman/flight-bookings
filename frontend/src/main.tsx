import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import FloatingAiChat from "./components/FloatingAiChat";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import FlightDetail from "./pages/FlightDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Bookings from "./pages/Bookings";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/flight/:id" element={<FlightDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
        <FloatingAiChat />
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
