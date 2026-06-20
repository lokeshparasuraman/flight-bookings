import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

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

export default function AvailableRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Background Animations */}
      <div className="bg-blobs">
        <div className="grid-pattern" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
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
                <div className="card p-12 text-center max-w-lg mx-auto">
                  <div className="text-6xl mb-4">✈️🗺️</div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    No routes found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try checking your search criteria or explore other destinations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRoutes.map((r, idx) => (
                    <div
                      key={`${r.origin}-${r.destination}-${idx}`}
                      onClick={() => handleRouteClick(r.origin, r.destination)}
                      className="card p-5 cursor-pointer flex items-center justify-between hover:scale-[1.02] active:scale-[0.99] border border-gray-100 dark:border-gray-800 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-extrabold text-booking-blue dark:text-booking-lightblue">
                            {r.origin}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold max-w-[120px] truncate">
                            {airportNames[r.origin]?.split(" (")[0] || r.origin}
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-gray-400 group-hover:text-booking-lightblue transition-colors duration-300 text-xl font-semibold">
                            ➔
                          </span>
                          <span className="text-[9px] bg-booking-lightblue/10 text-booking-lightblue px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                            {r._count.id} {r._count.id === 1 ? 'Flight' : 'Flights'}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-extrabold text-booking-blue dark:text-booking-lightblue">
                            {r.destination}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold max-w-[120px] truncate">
                            {airportNames[r.destination]?.split(" (")[0] || r.destination}
                          </div>
                        </div>
                      </div>

                      <div className="pr-2">
                        <span className="text-booking-lightblue opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-lg font-bold">
                          Book ➔
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
