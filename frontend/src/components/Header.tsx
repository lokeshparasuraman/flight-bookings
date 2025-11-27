import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-booking-lightblue to-booking-blue bg-clip-text text-transparent font-['Poppins']">
              ✈️ FlyFast
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4 md:space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-booking-lightblue dark:hover:text-booking-lightblue font-medium transition-colors duration-200 hidden sm:block"
            >
              Search Flights
            </Link>
            {token && (
              <Link
                to="/bookings"
                className="text-gray-700 dark:text-gray-300 hover:text-booking-lightblue dark:hover:text-booking-lightblue font-medium transition-colors duration-200 hidden sm:block"
              >
                My Bookings
              </Link>
            )}
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-booking-lightblue"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <span className="text-xl">☀️</span>
              ) : (
                <span className="text-xl">🌙</span>
              )}
            </button>
            {/* Auth Buttons */}
            {token ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-booking-lightblue hover:bg-booking-lightblue hover:text-white font-semibold rounded-lg transition-all duration-200 border border-booking-lightblue"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-booking-lightblue font-semibold transition-colors duration-200 hidden sm:block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-booking-lightblue hover:bg-booking-blue text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
