import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import Footer from "../components/Footer";
import { GlobeIcon, FlightIcon, OfficeBuildingIcon, HeartIcon } from "../components/Icons";
import { useToast } from "../contexts/ToastContext";

interface RouteInfo {
  origin: string;
  destination: string;
  _count: {
    id: number;
  };
}

// Full name mapping for Indian airport codes
const airportNames: Record<string, string> = {
  DEL: "Delhi (Indira Gandhi International)",
  BOM: "Mumbai (Chhatrapati Shivaji Maharaj)",
  BLR: "Bangalore (Kempegowda International)",
  MAA: "Chennai (International)",
  CCU: "Kolkata (Netaji Subhash Chandra Bose)",
  HYD: "Hyderabad (Rajiv Gandhi International)",
  PNQ: "Pune (Airport)",
  AMD: "Ahmedabad (Sardar Vallabhbhai Patel)",
  GOI: "Goa (Dabolim)",
  COK: "Cochin (International)",
  JAI: "Jaipur (International)"
};

// Full city alternate keywords and synonyms
const airportKeywords: Record<string, string> = {
  delhi: "DEL",
  "new delhi": "DEL",
  del: "DEL",
  mumbai: "BOM",
  bombay: "BOM",
  bom: "BOM",
  bangalore: "BLR",
  bengaluru: "BLR",
  blr: "BLR",
  chennai: "MAA",
  madras: "MAA",
  maa: "MAA",
  kolkata: "CCU",
  calcutta: "CCU",
  ccu: "CCU",
  hyderabad: "HYD",
  secunderabad: "HYD",
  hyd: "HYD",
  pune: "PNQ",
  poona: "PNQ",
  pnq: "PNQ",
  ahmedabad: "AMD",
  amdavad: "AMD",
  amd: "AMD",
  goa: "GOI",
  dabolim: "GOI",
  goi: "GOI",
  cochin: "COK",
  kochi: "COK",
  cok: "COK",
  jaipur: "JAI",
  "pink city": "JAI",
  pinkcity: "JAI",
  jai: "JAI"
};

// Resolves query input parts to matching airport codes
function getMatchingCodes(queryPart: string): string[] {
  const clean = queryPart.trim().toLowerCase();
  if (!clean) return [];
  
  const codes = new Set<string>();
  
  // Exact or prefix match on IATA airport code
  for (const code of Object.keys(airportNames)) {
    if (code.toLowerCase() === clean || code.toLowerCase().startsWith(clean)) {
      codes.add(code);
    }
  }
  
  // Match against city alternate keywords/synonyms
  for (const [kw, code] of Object.entries(airportKeywords)) {
    if (kw.includes(clean) || clean.includes(kw)) {
      codes.add(code);
    }
  }
  
  // Match against full airport names listed in main map
  for (const [code, fullName] of Object.entries(airportNames)) {
    if (fullName.toLowerCase().includes(clean)) {
      codes.add(code);
    }
  }
  
  return Array.from(codes);
}

const SearchIcon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const RoutesIllustration = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 dark:text-gray-700">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </svg>
);

export default function AvailableRoutes() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const today = new Date().toISOString().split("T")[0];

  const fetchRoutes = async () => {
    const cached = localStorage.getItem("cachedRoutes");
    if (cached) {
      try {
        setRoutes(JSON.parse(cached));
        setLoading(false);
      } catch (e) {}
    } else {
      setLoading(true);
    }
    setError(null);

    let success = false;
    let attempts = 0;
    while (!success && attempts < 3) {
      try {
        const r = await api.get("/flights/routes");
        const fetchedRoutes = Array.isArray(r.data) ? r.data : [];
        setRoutes(fetchedRoutes);
        localStorage.setItem("cachedRoutes", JSON.stringify(fetchedRoutes));
        success = true;
      } catch (err) {
        attempts++;
        if (attempts >= 3) {
           if (!cached) setError("Network error. Unable to load routes. Please check your connection.");
        } else {
           await new Promise(res => setTimeout(res, 1000 * attempts));
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRoutes();
    
    // Load initial wishlist
    try {
      const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(wl);
    } catch (e) {
      setWishlist([]);
    }
    
    const handleSync = () => {
      try {
        const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlist(wl);
      } catch (e) {
        setWishlist([]);
      }
    };
    window.addEventListener("wishlistUpdated", handleSync);
    return () => window.removeEventListener("wishlistUpdated", handleSync);
  }, []);

  const toggleWishlist = (e: React.MouseEvent, route: RouteInfo) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const idx = wl.findIndex((x: any) => x.origin === route.origin && x.destination === route.destination && !x.basePriceCents);
      let updated = [];
      if (idx > -1) {
        updated = wl.filter((_: any, i: number) => i !== idx);
        showToast("info", "Route removed from wishlist!");
      } else {
        updated = [...wl, { origin: route.origin, destination: route.destination }];
        showToast("success", "Route added to wishlist!");
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlist(updated);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (e) {
      showToast("error", "Failed to update wishlist");
    }
  };

  const isRouteWishlisted = (r: RouteInfo) => {
    return wishlist.some((x: any) => x.origin === r.origin && x.destination === r.destination && !x.basePriceCents);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const handleRouteClick = (origin: string, destination: string) => {
    navigate(`/search?origin=${origin}&destination=${destination}&date=${today}`);
  };

  const filteredRoutes = routes.filter((r) => {
    const o = r.origin.toUpperCase();
    const d = r.destination.toUpperCase();
    const query = filterText.trim().toLowerCase();
    
    if (!query) return true;

    // Check for "from X to Y", "X to Y", "X -> Y", "X - Y"
    const toMatch = query.match(/(?:from\s+)?(.+?)\s*(?:to|->|-)\s+(.+)/i);
    // Check for "to Y from X"
    const fromMatch = query.match(/(?:to\s+)(.+?)\s*(?:from)\s+(.+)/i);

    let originQuery = "";
    let destQuery = "";

    if (toMatch) {
      originQuery = toMatch[1].trim();
      destQuery = toMatch[2].trim();
    } else if (fromMatch) {
      destQuery = fromMatch[1].trim();
      originQuery = fromMatch[2].trim();
    }

    if (originQuery || destQuery) {
      const originCodes = getMatchingCodes(originQuery);
      const destCodes = getMatchingCodes(destQuery);

      const matchesOrigin = originCodes.length > 0 ? originCodes.includes(o) : false;
      const matchesDest = destCodes.length > 0 ? destCodes.includes(d) : false;

      if (originCodes.length > 0 && destCodes.length > 0) {
        return matchesOrigin && matchesDest;
      } else if (originCodes.length > 0) {
        return matchesOrigin;
      } else if (destCodes.length > 0) {
        return matchesDest;
      }
    }

    // Default: query doesn't match a directional structure, search either origin or destination
    const searchCodes = getMatchingCodes(query);
    if (searchCodes.length > 0) {
      return searchCodes.includes(o) || searchCodes.includes(d);
    }

    // String matches on names or codes directly as final fallback
    const originName = (airportNames[o] || "").toUpperCase();
    const destName = (airportNames[d] || "").toUpperCase();
    const upperQuery = query.toUpperCase();
    return o.includes(upperQuery) || d.includes(upperQuery) || originName.includes(upperQuery) || destName.includes(upperQuery);
  });

  // Stats Calculations
  const totalRoutes = filteredRoutes.length;
  const totalFlights = filteredRoutes.reduce((acc, r) => acc + r._count.id, 0);

  // Find primary hub from filtered routes (prefer major metro hubs DEL/BOM/BLR/HYD/MAA/CCU on ties, never Pune)
  const hubPriority = ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU"];
  const outgoingCounts: Record<string, number> = {};
  filteredRoutes.forEach((r) => {
    outgoingCounts[r.origin] = (outgoingCounts[r.origin] || 0) + r._count.id;
  });
  
  let primaryHub = "N/A";
  let maxOutgoing = 0;
  Object.entries(outgoingCounts).forEach(([code, count]) => {
    if (count > maxOutgoing) {
      maxOutgoing = count;
      primaryHub = code;
    } else if (count === maxOutgoing && maxOutgoing > 0) {
      const currentIdx = hubPriority.indexOf(code);
      const chosenIdx = hubPriority.indexOf(primaryHub);
      if (currentIdx !== -1 && (chosenIdx === -1 || currentIdx < chosenIdx)) {
        primaryHub = code;
      }
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Background Animations */}
      <div className="bg-blobs">
        <div className="grid-pattern" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="container py-12 max-w-5xl">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-booking-blue via-booking-lightblue to-booking-blue bg-clip-text text-transparent">
              Available Routes
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Browse all operational flight connections across India. Click any route to view available flights for today.
            </p>
          </div>

          {/* Stats Section */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up" style={{ animationDelay: "0.02s" }}>
              {/* Stat 1 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-booking-blue/10 dark:bg-booking-blue/20 rounded-xl">
                    <GlobeIcon size={24} className="text-booking-blue dark:text-booking-lightblue" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      Total Routes
                    </div>
                    <div className="text-2xl font-extrabold text-booking-blue dark:text-booking-lightblue">
                      {totalRoutes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-booking-lightblue/10 dark:bg-booking-lightblue/20 rounded-xl">
                    <FlightIcon size={24} className="text-booking-lightblue" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      Daily Flights
                    </div>
                    <div className="text-2xl font-extrabold text-booking-blue dark:text-booking-lightblue">
                      {totalFlights}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl">
                    <OfficeBuildingIcon size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      Primary Hub
                    </div>
                    <div className="text-2xl font-extrabold text-booking-blue dark:text-booking-lightblue truncate max-w-[200px]">
                      {primaryHub} {primaryHub !== "N/A" && <span className="text-xs text-gray-400 font-semibold">({airportNames[primaryHub]?.split(" (")[0] || primaryHub})</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search/Filter Widget */}
          <div className="max-w-md mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="relative">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search city, airport, or code (e.g. BOM)..."
                className="input-field py-3.5 pl-11 pr-4 shadow-soft"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon size={18} />
              </span>
              {filterText && (
                <button
                  onClick={() => setFilterText("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-booking-lightblue"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl backdrop-blur-md">
              <p className="text-red-500 dark:text-red-400 font-bold mb-4">{error}</p>
              <button onClick={() => fetchRoutes()} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-extrabold transition-all shadow-md hover:shadow-lg">Try Again</button>
            </div>
          ) : (
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {filteredRoutes.length === 0 ? (
                <div className="card p-12 text-center max-w-lg mx-auto bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl shadow-xl">
                  <div className="mb-4">
                    <RoutesIllustration />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    No routes found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try checking your search criteria or explore other destinations.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedRoutes.map((r, idx) => (
                      <div
                        key={`${r.origin}-${r.destination}-${idx}`}
                        onClick={() => handleRouteClick(r.origin, r.destination)}
                        className="relative overflow-hidden group cursor-pointer backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/60 dark:hover:bg-gray-800/60"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        
                        <button
                          onClick={(e) => toggleWishlist(e, r)}
                          className="absolute top-4 right-4 z-20 p-2.5 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-all focus:outline-none flex items-center justify-center shadow-sm rounded-full backdrop-blur-md"
                          aria-label="Add to Wishlist"
                        >
                          <HeartIcon className={`w-5 h-5 ${isRouteWishlisted(r) ? "text-red-500 fill-current scale-110" : "text-gray-400 dark:text-gray-500"} transition-all duration-200`} />
                        </button>
                        
                        <div className="flex items-center justify-between mb-4 pr-12">
                          <div className="flex items-center space-x-2">
                             <span className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md">Route #{((currentPage - 1) * itemsPerPage) + idx + 1}</span>
                          </div>
                          <span className="text-xs font-bold text-booking-lightblue bg-booking-lightblue/10 dark:bg-booking-lightblue/20 px-3 py-1 rounded-full border border-booking-lightblue/20 backdrop-blur-md">
                            {r._count.id} {r._count.id === 1 ? 'Flight' : 'Flights'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center relative py-2">
                          <div className="flex flex-col items-center flex-1">
                            <span className="text-3xl md:text-4xl font-extrabold text-booking-blue dark:text-booking-lightblue tracking-tighter">{r.origin}</span>
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center max-w-[110px] truncate mt-1" title={airportNames[r.origin] || r.origin}>
                               {airportNames[r.origin] || r.origin}
                            </span>
                          </div>

                          <div className="flex-1 flex flex-col justify-center items-center px-2 relative h-10">
                            <div className="w-full h-[2px] border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                            <FlightIcon className="w-6 h-6 text-booking-blue dark:text-booking-lightblue absolute transform -rotate-45 group-hover:translate-x-3 transition-transform duration-500" />
                          </div>

                          <div className="flex flex-col items-center flex-1">
                            <span className="text-3xl md:text-4xl font-extrabold text-booking-blue dark:text-booking-lightblue tracking-tighter">{r.destination}</span>
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center max-w-[110px] truncate mt-1" title={airportNames[r.destination] || r.destination}>
                               {airportNames[r.destination] || r.destination}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center relative z-10">
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Route
                          </div>
                          <button className="text-xs font-bold bg-gradient-to-r from-booking-blue to-booking-lightblue text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg group-hover:shadow-booking-blue/40 transform group-hover:-translate-y-0.5">
                            Book Now ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {Math.min(currentPage * itemsPerPage, filteredRoutes.length)}
                        </span>{" "}
                        of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredRoutes.length}</span> routes
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                          }}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          Previous
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                          }}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
