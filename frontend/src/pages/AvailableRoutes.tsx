import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import Footer from "../components/Footer";
import { GlobeIcon, FlightIcon, OfficeBuildingIcon } from "../components/Icons";

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
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/flights/routes")
      .then((r) => {
        setRoutes(Array.isArray(r.data) ? r.data : []);
      })
      .catch((err) => {
        console.error("Failed to load routes", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
          ) : (
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {filteredRoutes.length === 0 ? (
                <div className="card p-12 text-center max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
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
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-soft bg-white dark:bg-gray-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-200/80 dark:border-gray-800">
                          <th className="py-4 px-6 text-center w-16">#</th>
                          <th className="py-4 px-6">Origin Airport (From)</th>
                          <th className="py-4 px-6">Destination Airport (To)</th>
                          <th className="py-4 px-6 text-center w-40">Daily Flights</th>
                          <th className="py-4 px-6 text-right w-44">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {paginatedRoutes.map((r, idx) => (
                          <tr
                            key={`${r.origin}-${r.destination}-${idx}`}
                            onClick={() => handleRouteClick(r.origin, r.destination)}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors duration-150 cursor-pointer group"
                          >
                            {/* S.No */}
                            <td className="py-4 px-6 text-center text-xs font-bold text-gray-400">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            
                            {/* Origin */}
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <span className="px-2 py-1 bg-booking-blue/10 dark:bg-booking-blue/20 text-booking-blue dark:text-booking-lightblue font-extrabold text-sm rounded-lg min-w-[48px] text-center">
                                  {r.origin}
                                </span>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                                  {airportNames[r.origin] || r.origin}
                                </span>
                              </div>
                            </td>
                            
                            {/* Destination */}
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <span className="px-2 py-1 bg-booking-blue/10 dark:bg-booking-blue/20 text-booking-blue dark:text-booking-lightblue font-extrabold text-sm rounded-lg min-w-[48px] text-center">
                                  {r.destination}
                                </span>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                                  {airportNames[r.destination] || r.destination}
                                </span>
                              </div>
                            </td>
                            
                            {/* Daily Flights Count */}
                            <td className="py-4 px-6 text-center">
                              <span className="text-xs font-bold text-booking-lightblue bg-booking-lightblue/10 dark:bg-booking-lightblue/20 px-3 py-1 rounded-full border border-booking-lightblue/20">
                                {r._count.id} {r._count.id === 1 ? 'Flight' : 'Flights'}
                              </span>
                            </td>
                            
                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <button className="text-xs font-bold bg-booking-blue hover:bg-booking-lightblue text-white px-3.5 py-1.5 rounded-lg transition-colors duration-150 shadow-soft group-hover:scale-105 transform">
                                Book Flights ➔
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
