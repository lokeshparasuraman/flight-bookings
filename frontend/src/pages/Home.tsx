/**
 * Home.tsx — Landing Page / Main Search Hub
 *
 * This is the biggest page in the app. It handles:
 * - The hero banner with the main search panel
 * - A 10-tab search form (Flights, Hotels, Homestays, Holidays, Trains,
 *   Buses, Cabs, Tours, Cruise, Insurance)
 * - The "Explore India" section with filterable destination cards
 * - The draggable floating AI assistant button
 *
 * SEARCH FLOW:
 * The flight search form collects origin/destination airport codes (3-letter IATA),
 * departure date, optional return date (for round trips), and traveler count.
 * On submit, it navigates to /search?origin=DEL&destination=BOM&date=...
 * SearchResults page handles the actual API call.
 *
 * OTHER TABS:
 * Hotels, Homestays, Trains etc. are UI mockups — they render form fields
 * but currently don't route to separate search pages. Flights is the only
 * tab with a live backend.
 *
 * EXPLORE SECTION:
 * Destination cards come from the `allPlaces` array below. Filtered by
 * the activeTab to show relevant places for each travel category.
 * Clicking a card opens a detail sheet with images, description, highlights.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EnhancedAiChat from "../components/EnhancedAiChat";
import { getLocalDateString } from "../utils/dateUtils";

import {
  FlightIcon,
  HotelIcon,
  VillaIcon,
  HolidayIcon,
  TrainIcon,
  BusIcon,
  CabIcon,
  ToursIcon,
  VisaIcon,
  CruiseIcon,
  ForexIcon,
  InsuranceIcon,
  SecureIcon,
  FlashIcon,
  RobotIcon,
  ChatBubbleIcon,
  TagIcon,
  HeartIcon
} from "../components/Icons";
import { useToast } from "../contexts/ToastContext";
import Footer from "../components/Footer";
import Tooltip from "../components/Tooltip";

const airportMapping: Record<string, string> = {
  DEL: "New Delhi, Indira Gandhi Intl Airport",
  BOM: "Mumbai, Chhatrapati Shivaji Maharaj Airport",
  BLR: "Bengaluru, Kempegowda Airport",
  MAA: "Chennai International Airport",
  CCU: "Kolkata, Netaji Bose Airport",
  HYD: "Hyderabad, Rajiv Gandhi Airport",
  PNQ: "Pune Airport",
  AMD: "Ahmedabad Airport",
  GOI: "Goa, Dabolim Airport",
  COK: "Kochi, Cochin Airport",
  JAI: "Jaipur Airport",
  MYS: "Mysore Airport"
};

function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp.push([i]);
  }
  for (j = 1; j <= b.length; j++) {
    tmp[0].push(j);
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function isFuzzyMatch(text: string, query: string): boolean {
  const cleanText = text.toLowerCase().trim();
  const cleanQuery = query.toLowerCase().trim();
  
  if (!cleanQuery) return true;
  
  // Spaceless direct match check (ignores spaces/spacing completely!)
  const spacelessText = cleanText.replace(/[\s,.-]+/g, "");
  const spacelessQuery = cleanQuery.replace(/[\s,.-]+/g, "");
  if (spacelessText.includes(spacelessQuery)) return true;
  
  // Word-by-word fuzzy matching for typos
  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
  const textWords = cleanText.split(/[\s,.-]+/).filter(Boolean);
  
  return queryWords.every(qw => {
    if (qw.length <= 2) {
      return textWords.some(tw => tw.includes(qw));
    }
    const maxDistance = qw.length <= 4 ? 1 : 2;
    return textWords.some(tw => {
      // Direct substring match (text word includes query word)
      if (tw.includes(qw)) return true;
      
      // Fuzzy match
      if (tw.length >= qw.length) {
        for (let i = 0; i <= tw.length - qw.length; i++) {
          const slice = tw.slice(i, i + qw.length);
          if (getLevenshteinDistance(slice, qw) <= maxDistance) {
            return true;
          }
        }
      } else {
        if (getLevenshteinDistance(tw, qw) <= maxDistance) {
          return true;
        }
      }
      return false;
    });
  });
}

function resolveAirport(input: string): string | null {
  const clean = input.trim().toUpperCase();
  if (!clean) return null;
  if (airportMapping[clean]) return clean;
  
  for (const code of Object.keys(airportMapping)) {
    if (code.startsWith(clean) || clean.startsWith(code)) {
      return code;
    }
  }
  
  let bestCode: string | null = null;
  let bestDistance = Infinity;
  const cleanInput = clean.toLowerCase();
  
  for (const [code, fullName] of Object.entries(airportMapping)) {
    const cleanName = fullName.toLowerCase();
    if (cleanName.includes(cleanInput)) return code;
    
    const inputWords = cleanInput.split(/\s+/).filter(Boolean);
    const nameWords = cleanName.split(/[\s,.-]+/).filter(Boolean);
    
    for (const iw of inputWords) {
      if (iw.length <= 2) continue;
      for (const nw of nameWords) {
        if (nw.length <= 2) continue;
        const distance = getLevenshteinDistance(iw, nw);
        const maxDistance = iw.length <= 4 ? 1 : 2;
        if (distance <= maxDistance && distance < bestDistance) {
          bestDistance = distance;
          bestCode = code;
        }
      }
    }
  }
  return bestCode;
}

function getSuggestions(input: string) {
  const query = input.trim().toLowerCase();
  const allAirports = Object.entries(airportMapping).map(([code, fullName]) => {
    const parts = fullName.split(", ");
    return {
      code,
      city: parts[0],
      name: parts[1] || fullName
    };
  });
  
  if (!query) return allAirports;
  
  return allAirports
    .map(airport => {
      let score = 0;
      const cleanCity = airport.city.toLowerCase();
      const cleanName = airport.name.toLowerCase();
      const cleanCode = airport.code.toLowerCase();
      
      if (cleanCode === query) score = 100;
      else if (cleanCode.startsWith(query)) score = 90;
      else if (cleanCity.startsWith(query)) score = 80;
      else if (cleanCity.includes(query)) score = 60;
      else if (cleanName.includes(query)) score = 40;
      else if (isFuzzyMatch(airport.city + " " + airport.name, query)) score = 20;
      
      return { ...airport, score };
    })
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score);
}



/**
 * DraggableAiButton — Floating Draggable AI Chat Launcher
 *
 * This button floats over the page content and can be dragged anywhere on screen.
 * It starts in the bottom-right corner (near the classic FAB position).
 *
 * DRAG vs CLICK detection:
 * We use a `moved` ref to track whether the pointer moved more than 3px during
 * a press. If it moved, we treat it as a drag (don't fire the onClick).
 * If it didn't move, we treat it as a tap/click (opens the AI chat).
 *
 * BOUNDARY CLAMPING:
 * The position is clamped to the viewport edges so the button can never
 * be dragged off-screen. We subtract the button size (68px) from the
 * viewport width/height for the max values.
 *
 * POINTER CAPTURE:
 * setPointerCapture means the element continues to receive pointer events
 * even if the cursor moves outside it — essential for smooth drag behaviour.
 */
function DraggableAiButton({ onClick }: { onClick: () => void }) {
  const btnRef = useRef<HTMLDivElement>(null);

  // Tracks whether we're currently in a drag gesture
  const dragging = useRef(false);

  // Stores the pointer position at drag start
  const startPos = useRef({ x: 0, y: 0 });

  // Stores the button position at drag start
  const startBtn = useRef({ x: 0, y: 0 });

  // true if the pointer moved enough to count as a drag (not a click)
  const moved = useRef(false);

  // Current position of the button — null until the viewport size is known
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Set initial position to bottom-right, 84px from each edge
    // We do this in useEffect (not useState initial value) because we need
    // window.innerWidth/Height which aren't available during SSR
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({ x: vw - 84, y: vh - 84 });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!btnRef.current) return;
    dragging.current = true;
    moved.current = false;
    const rect = btnRef.current.getBoundingClientRect();
    startPos.current = { x: e.clientX, y: e.clientY };
    startBtn.current = { x: rect.left, y: rect.top };
    // Capture pointer so we keep getting events even if cursor leaves the element
    btnRef.current.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    // Mark as moved if the pointer went more than 3px in any direction
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Clamp position so the button stays fully on screen
    const newX = Math.min(vw - 68, Math.max(0, startBtn.current.x + dx));
    const newY = Math.min(vh - 68, Math.max(0, startBtn.current.y + dy));
    setPos({ x: newX, y: newY });
  };

  const onPointerUp = (_e: React.PointerEvent) => {
    dragging.current = false;
    // Only fire onClick if the user didn't drag — otherwise it was just a move
    if (!moved.current) onClick();
  };

  // Don't render until we know the viewport size (avoids flash at wrong position)
  if (!pos) return null;

  return (
    <div
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 select-none cursor-grab active:cursor-grabbing touch-none"
      title="Ask FlyFast AI"
    >
      {/* The circular gradient button — violet/fuchsia/blue gradient */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-[#008cff] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
        <RobotIcon className="w-8 h-8 text-white" />
        {/* Green dot in top-right corner to indicate the AI is online/active */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
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

  const toggleWishlistPlace = (e: React.MouseEvent, place: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const idx = wl.findIndex((x: any) => x.id === place.id && x.title === place.title);
      let updated = [];
      if (idx > -1) {
        updated = wl.filter((_: any, i: number) => i !== idx);
        showToast("info", "Place removed from wishlist!");
      } else {
        updated = [...wl, { id: place.id, title: place.title, type: place.type, img: place.img, price: place.price, state: place.state }];
        showToast("success", "Place added to wishlist!");
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlist(updated);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (e) {
      showToast("error", "Failed to update wishlist");
    }
  };

  const isPlaceWishlisted = (place: any) => {
    return wishlist.some((x: any) => x.id === place.id && x.title === place.title);
  };

  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("BOM");
  const [originInput, setOriginInput] = useState("DEL");
  const [destinationInput, setDestinationInput] = useState("BOM");
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [date, setDate] = useState(getLocalDateString());
  const [returnDate, setReturnDate] = useState(
    getLocalDateString(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  );
  const [travelers, setTravelers] = useState<number | "">(1);
  const [showAiChat, setShowAiChat] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedExplorePlace, setSelectedExplorePlace] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedSpecialFare, setSelectedSpecialFare] = useState("regular");
  const [hotelCity, setHotelCity] = useState("Delhi, NCR, India");
  const [homestayCity, setHomestayCity] = useState("Coorg, Karnataka, India");
  const [holidayDest, setHolidayDest] = useState("Goa, India");
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [insuranceCountry, setInsuranceCountry] = useState("Thailand");

  const handleSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tempOrigin = origin;
    const tempOriginInput = originInput;
    
    setOrigin(destination);
    setOriginInput(destinationInput);
    
    setDestination(tempOrigin);
    setDestinationInput(tempOriginInput);
  };

  React.useEffect(() => {
    setActiveImageIndex(0);
    if (!selectedExplorePlace) return;
    const imgs = selectedExplorePlace.imgs || [selectedExplorePlace.img];
    if (imgs.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [selectedExplorePlace]);

  const allPlaces = [
    // ── Flights ─────────────────────────────────────────────────────────────
    { id: "agra", type: "flights", state: "Uttar Pradesh", code: "DEL", title: "Agra (Taj Mahal)", desc: "Witness the monumental symbol of eternal love.", details: "Agra is home to the iconic Taj Mahal, a UNESCO World Heritage site and monument of eternal love built by Mughal Emperor Shah Jahan. The city also features Agra Fort, Akbar's Tomb, and Fatehpur Sikri, offering a deep dive into rich heritage.", highlights: "Taj Mahal Visit, Agra Fort Exploration, Traditional Mughal Cuisine tasting, Sunset over Yamuna River", bestTime: "October to March", img: "/places/taj_mahal.png", imgs: ["/places/taj_mahal.png", "/places/taj_mahal_detail.png"], price: "₹2,499" },
    { id: "goa", type: "flights", state: "Goa", code: "GOI", title: "Goa Beaches", desc: "Soak in the sun at India's favorite beach paradise.", details: "Goa is renowned for its spectacular beaches, vibrant nightlife, Portuguese colonial architecture, and active water sports culture. North Goa offers lively clubs and busy coastlines, while South Goa offers tranquil, serene beaches.", highlights: "Beach hopping (Baga, Calangute, Palolem), Water sports & Scuba diving, Portuguese Forts visit, Seafood dining", bestTime: "November to February", img: "/places/goa_beach.png", imgs: ["/places/goa_beach.png", "/places/goa_sunset.png"], price: "₹3,199" },
    { id: "kerala", type: "flights", state: "Kerala", code: "COK", title: "Kerala Backwaters", desc: "Unwind on a peaceful houseboat cruise through nature.", details: "Alleppey (Alappuzha) backwaters in Kerala are a vast, serene network of lakes, canals, and rivers. Cruising in a traditional houseboat allows you to witness scenic coconut groves, local fishing villages, and rich green landscape.", highlights: "Overnight Houseboat Cruise, Traditional Kerala Meals, Ayurvedic wellness therapies, Bird Sanctuary visits", bestTime: "September to March", img: "/places/kerala_houseboat.png", imgs: ["/places/kerala_houseboat.png"], price: "₹4,299" },
    { id: "ooty_tn_flight", type: "flights", state: "Tamil Nadu", code: "CJB", title: "Ooty (Queen of Hill Stations)", desc: "Escape to the lush tea gardens and cool mountain air of Ooty.", details: "Ooty is a gorgeous hill station in the Nilgiri Hills of Tamil Nadu. Famed for its vast tea estates, colonial-era bungalows, Nilgiri Mountain Railway toy train, and serene gardens, it offers a refreshing mountain retreat.", highlights: "Nilgiri Mountain Railway ride, Ooty Lake boating, Botanical Garden stroll, Doddabetta Peak trek", bestTime: "October to June", img: "/places/ooty_tea_gardens.png", imgs: ["/places/ooty_tea_gardens.png"], price: "₹3,499" },
    { id: "madurai_tn_flight", type: "flights", state: "Tamil Nadu", code: "IXM", title: "Madurai (The Temple City)", desc: "Explore the architectural grandeur of Meenakshi Amman Temple.", details: "Madurai is one of India's oldest continuously inhabited cities. Built around the historic Meenakshi Amman Temple, it is renowned for its vibrant festival celebrations, incredible gopuram carvings, and flavorful local culinary heritage.", highlights: "Meenakshi Temple tour, Tirumalai Nayakkar Palace light show, Shopping for Madurai Sungudi sarees, Local street food tour", bestTime: "October to March", img: "/places/madurai_temple.png", imgs: ["/places/madurai_temple.png"], price: "₹2,999" },
    { id: "mahabalipuram_tn_flight", type: "flights", state: "Tamil Nadu", code: "MAA", title: "Mahabalipuram Shore", desc: "Gaze upon UNESCO-listed rock temples by the Bay of Bengal.", details: "Mahabalipuram is a historic town known for its UNESCO-listed group of Pallava monuments. Located on the coast of the Bay of Bengal, the Shore Temple, Five Rathas, and detailed rock carvings are breathtaking engineering feats of the 7th century.", highlights: "Shore Temple sunset walk, Five Rathas rock carvings, Arjuna's Penance relief, Beachside seafood dining", bestTime: "November to February", img: "/places/mahabalipuram_shore.png", imgs: ["/places/mahabalipuram_shore.png"], price: "₹2,799" },
    { id: "jaipur_flight", type: "flights", state: "Rajasthan", code: "JAI", title: "Jaipur (The Pink City)", desc: "Explore the royal palaces and vibrant bazaars of Rajasthan's capital.", details: "Jaipur, the capital of Rajasthan, is known for its distinctive pink-colored buildings and stunning Rajput architecture. Visit the grand Amber Fort, the Hawa Mahal, and the City Palace. The city is a living museum of Rajasthan's royal heritage.", highlights: "Amber Fort elephant ride, Hawa Mahal photography, City Palace tour, Local gem shopping at Johari Bazaar", bestTime: "October to March", img: "/places/jaipur_amber_fort.png", imgs: ["/places/jaipur_amber_fort.png"], price: "₹2,799" },
    { id: "bengaluru_flight", type: "flights", state: "Karnataka", code: "BLR", title: "Bengaluru (Garden City)", desc: "Discover India's tech hub with lush parks and vibrant nightlife.", details: "Bengaluru, India's Silicon Valley, blends modernity with colonial heritage. Explore the sprawling Lalbagh Botanical Garden, the historic Tipu Sultan's Palace, ISKCON temple, and enjoy a thriving craft beer and restaurant scene.", highlights: "Lalbagh Botanical Garden, Cubbon Park morning walk, UB City luxury shopping, Nandi Hills sunrise trek", bestTime: "October to February", img: "/places/bengaluru_lalbagh.png", imgs: ["/places/bengaluru_lalbagh.png", "/places/bengaluru_nightlife.png"], price: "₹3,999" },
    { id: "mumbai_flight", type: "flights", state: "Maharashtra", code: "BOM", title: "Mumbai (City of Dreams)", desc: "Experience the energy of India's financial capital and entertainment hub.", details: "Mumbai, the city that never sleeps, is a bustling metropolis blending colonial architecture with Bollywood glamour. Visit the iconic Gateway of India, Marine Drive, Elephanta Caves (UNESCO), and Chhatrapati Shivaji Terminus.", highlights: "Gateway of India, Marine Drive sunset, Elephanta Caves UNESCO visit, Dharavi walking tour", bestTime: "November to February", img: "/places/mumbai_gateway.png", imgs: ["/places/mumbai_gateway.png"], price: "₹4,599" },
    { id: "varanasi_flight", type: "flights", state: "Uttar Pradesh", code: "VNS", title: "Varanasi (City of Light)", desc: "Witness ancient ghats and sacred rituals along the Ganges river.", details: "Varanasi, one of the world's oldest living cities, is a deeply spiritual place where life and death converge on the sacred Ganges ghats. Witness the mesmerizing Ganga Aarti ceremony, explore narrow temple-lined lanes, and visit the ancient Kashi Vishwanath temple.", highlights: "Ganga Aarti ceremony, Boat ride at dawn, Kashi Vishwanath temple visit, Old city heritage walk", bestTime: "October to March", img: "/places/varanasi_ghat.png", imgs: ["/places/varanasi_ghat.png"], price: "₹3,299" },
    { id: "munnar_flight", type: "flights", state: "Kerala", code: "COK", title: "Munnar Tea Gardens", desc: "Trek through endless rolling tea estates in Kerala's misty highlands.", details: "Munnar is a picturesque hill station in Kerala's Western Ghats, famous for its vast tea plantations, spice gardens, and stunning mountain landscapes. Visit the Tea Museum, trek to Anamudi Peak, and spot rare Neelakurinji flowers.", highlights: "Tea estate guided walk, Eravikulam National Park, Mattupetty Dam scenic drive, Spice garden tour", bestTime: "September to May", img: "/places/munnar_tea_estate.png", imgs: ["/places/munnar_tea_estate.png"], price: "₹5,199" },
    { id: "pondicherry_flight", type: "flights", state: "Tamil Nadu", code: "MAA", title: "Pondicherry (French Riviera of the East)", desc: "Stroll through French colonial streets by the Bay of Bengal.", details: "Pondicherry, a former French colonial territory, offers a unique blend of French and Tamil cultures. The White Town features charming colonial villas, French cafes, and promenades by the sea. Visit Auroville, the international spiritual township.", highlights: "French Quarter heritage walk, Auroville meditation center, Rock Beach sunrise, Sri Aurobindo Ashram visit", bestTime: "October to March", img: "/places/pondicherry_french_quarter.png", imgs: ["/places/pondicherry_french_quarter.png"], price: "₹2,199" },

    // ── Hotels ──────────────────────────────────────────────────────────────
    { id: "udaipur", type: "hotels", state: "Rajasthan", title: "Taj Lake Palace, Udaipur", desc: "Experience royal luxury floating on serene waters.", details: "Taj Lake Palace is a heritage hotel featuring stunning white marble architecture, built in 1746 by Maharana Jagat Singh II. Located on Lake Pichola, it offers royal luxury dining, vintage car tours, and boat cruises.", highlights: "Floating lake views, Fine-dining royal experience, Jharokha window architecture, Spa boat cruise", bestTime: "October to March", img: "/places/lake_palace.png", imgs: ["/places/lake_palace.png"], rating: "4.9 ★" },
    { id: "delhi", type: "hotels", state: "Delhi", title: "The Imperial, New Delhi", desc: "Colonial-style heritage hotel in the heart of Delhi.", details: "Built in 1931, The Imperial is an award-winning colonial-style luxury hotel situated near Connaught Place. It features high ceilings, lush green gardens, a historic collection of museum art, and top-tier dining.", highlights: "Heritage art walk, Royal afternoon tea, Multi-cuisine fine dining, Luxury wellness spa", bestTime: "October to March", img: "/places/delhi_imperial.png", imgs: ["/places/delhi_imperial.png", "/places/delhi_red_fort.png"], rating: "4.8 ★" },
    { id: "goa_hotel", type: "hotels", state: "Goa", title: "Taj Exotica Resort, Goa", desc: "Luxury beachfront resort on the serene shores of South Goa.", details: "Taj Exotica is a spectacular 56-acre resort situated on Benaulim beach in South Goa. This elegant property offers private beach access, multiple dining venues, a luxury spa, and world-class water sports facilities in a lush tropical setting.", highlights: "Private beach access, Infinity pool with ocean views, Jiva Spa therapy, Multi-cuisine dining with live music", bestTime: "November to February", img: "/places/goa_sunset.png", imgs: ["/places/goa_sunset.png", "/places/goa_beach.png"], rating: "4.7 ★" },
    { id: "kerala_hotel", type: "hotels", state: "Kerala", title: "Kumarakom Lake Resort, Kerala", desc: "Heritage resort floating on the scenic Vembanad Lake.", details: "Kumarakom Lake Resort is an award-winning heritage property on the banks of the stunning Vembanad Lake. The resort features traditional Kerala architecture, private pool villas, Ayurvedic rejuvenation programs, and evening cultural performances.", highlights: "Lakefront villa stay, Traditional Ayurvedic treatments, Sunset houseboat cruise, Bird sanctuary boat tour", bestTime: "September to March", img: "/places/kerala_houseboat.png", imgs: ["/places/kerala_houseboat.png"], rating: "4.8 ★" },
    { id: "mumbai_hotel", type: "hotels", state: "Maharashtra", title: "The Taj Mahal Palace, Mumbai", desc: "The iconic heritage hotel overlooking the Gateway of India.", details: "The Taj Mahal Palace, opened in 1903, is one of India's most iconic luxury hotels. Overlooking the Arabian Sea and the Gateway of India, it features stunning Moorish, Oriental, and Florentine architecture, world-class dining, and legendary hospitality.", highlights: "Gateway of India views, Fine dining at Masala Kraft, Heritage wing heritage tour, Rooftop Sea Lounge cocktails", bestTime: "November to February", img: "/places/mumbai_gateway.png", imgs: ["/places/mumbai_gateway.png"], rating: "4.9 ★" },
    { id: "ooty_tn_hotel", type: "hotels", state: "Tamil Nadu", title: "Savoy Hotel, Ooty", desc: "A grand colonial-era heritage hotel in the Nilgiri Hills.", details: "The Savoy Hotel in Ooty, established in 1829, is one of India's oldest heritage hotels. Set amidst manicured gardens and pine trees, the colonial-era cottages offer an authentic hill station experience with modern comforts.", highlights: "Colonial garden cottages, Rose garden walks, Archery and croquet lawns, Traditional high tea service", bestTime: "April to June", img: "/places/ooty_tea_gardens.png", imgs: ["/places/ooty_tea_gardens.png"], rating: "4.6 ★" },

    // ── Homestays ────────────────────────────────────────────────────────────
    { id: "coorg", type: "homestays", state: "Karnataka", title: "Cloud-Mist Villa, Coorg", desc: "Cozy estate cottage overlooking coffee valleys.", details: "Cloud-Mist Villa is a peaceful estate cottage nestled in the coffee plantations of Coorg. Wake up to misty mornings, fresh mountain air, scenic valley views, and local Kodava cuisine.", highlights: "Coffee plantation tour, Campfire under the stars, Trekking to Abbey Falls, Authentic Kodava meals", bestTime: "October to May", img: "/places/coorg_plantation.png", imgs: ["/places/coorg_plantation.png"], rating: "4.7 ★" },
    { id: "kodaikanal_tn_home", type: "homestays", state: "Tamil Nadu", title: "Kodaikanal (Princess of Hills)", desc: "Unwind around the misty lakes and pine forests.", details: "Kodaikanal is a misty hill town situated in the Palani Hills of Tamil Nadu. Centered around a man-made star-shaped lake, it features scenic forest trails, towering pine trees, cool waterfalls, and pleasant weather all year.", highlights: "Coaker's Walk viewpoint, Row boating on Kodaikanal Lake, Pine Forest stroll, Pillars Rocks view", bestTime: "September to May", img: "/places/kodaikanal_lake.png", imgs: ["/places/kodaikanal_lake.png"], rating: "4.6 ★" },
    { id: "goa_homestay", type: "homestays", state: "Goa", title: "Spice Garden Cottage, Goa", desc: "A rustic stay surrounded by aromatic spice plantations.", details: "A charming heritage homestay nestled in a working spice plantation in Ponda, Goa. Guests wake up to the fragrance of cardamom, pepper, and nutmeg, enjoy home-cooked Goan meals, and take guided plantation tours.", highlights: "Spice plantation guided tour, Home-cooked Goan fish curry lunch, Cashew feni tasting, Bird watching morning walks", bestTime: "October to April", img: "/places/goa_beach.png", imgs: ["/places/goa_beach.png"], rating: "4.5 ★" },
    { id: "wayanad_kerala_home", type: "homestays", state: "Kerala", title: "Treehouse Cottages, Wayanad", desc: "Wake up to misty jungle mornings in a scenic treetop cottage.", details: "Wayanad's treehouse stays offer a magical experience of living amidst the dense tropical jungle. Wake up to sounds of wildlife, trek through ancient caves, visit tribal villages, and experience authentic Kerala forest living.", highlights: "Treetop sunrise views, Edakkal Cave rock carvings visit, Chembra Peak trek, Tribal village cultural tour", bestTime: "October to May", img: "/places/wayanad_treehouse.png", imgs: ["/places/wayanad_treehouse.png"], rating: "4.8 ★" },
    { id: "lonavala_home", type: "homestays", state: "Maharashtra", title: "Tiger's Lair, Lonavala", desc: "A cozy hilltop retreat in the misty Sahyadri mountains.", details: "Tiger's Lair is a premium hillside resort in Lonavala, situated in the scenic Sahyadri mountain range. Offering stunning valley views, infinity pools, and adventure activities, it's the perfect weekend escape from Mumbai and Pune.", highlights: "Bhushi Dam waterfall walk, Rajmachi Fort trek, Local chikki shopping, Valley view sunset", bestTime: "June to September (Monsoon), October to February", img: "/places/lonavala_valley.png", imgs: ["/places/lonavala_valley.png"], rating: "4.4 ★" },

    // ── Buses ────────────────────────────────────────────────────────────────
    { id: "ooty", type: "buses", state: "Tamil Nadu", title: "Bangalore to Ooty", desc: "Scenic overnight luxury sleeper bus routes.", details: "Travel from the bustling tech hub of Bangalore to the serene hill station of Ooty in a premium sleeper bus. The journey passes through scenic forest areas, tea gardens, and the famous Bandipur Tiger Reserve hairpin curves.", highlights: "Bandipur Tiger Reserve views, Overnight luxury sleeper, Tea garden sightseeing, Ooty Lake boating", bestTime: "March to June", img: "/places/ooty_tea_gardens.png", imgs: ["/places/ooty_tea_gardens.png"], price: "₹899" },
    { id: "goa_bus", type: "buses", state: "Goa", title: "Panaji to Calangute Beach", desc: "Breezy coastal bus routes connecting Goa's best beaches.", details: "Hop on Goa's iconic Kadamba buses and explore the state's stunning coastline. The Panaji to Calangute route passes through scenic coastal villages, local markets, and offers stunning glimpses of the Arabian Sea.", highlights: "Calangute and Baga beach stops, Local market browsing, Panaji old city walk, Church of Our Lady of Immaculate Conception visit", bestTime: "November to February", img: "/places/goa_beach.png", imgs: ["/places/goa_beach.png"], price: "₹1,299" },
    { id: "jaipur_bus", type: "buses", state: "Rajasthan", title: "Delhi to Jaipur Express", desc: "Premium Volvo bus connecting Delhi to the Pink City.", details: "The Delhi to Jaipur Volvo bus is one of India's most popular intercity routes, covering 280 km in about 5-6 hours. Premium AC sleeper buses depart multiple times daily, offering a comfortable journey through Rajasthan's golden landscape.", highlights: "Comfortable AC Volvo coaches, Multiple daily departures, Amber Fort, Hawa Mahal, Jantar Mantar access", bestTime: "October to March", img: "/places/jaipur_amber_fort.png", imgs: ["/places/jaipur_amber_fort.png"], price: "₹1,099" },
    { id: "pondicherry_bus", type: "buses", state: "Tamil Nadu", title: "Chennai to Pondicherry", desc: "A scenic East Coast Road drive to the French Quarter.", details: "The Chennai to Pondicherry route along the East Coast Road (ECR) is one of South India's most scenic drives. State government buses run frequently, passing through beautiful fishing villages, beach resorts, and historic Mahabalipuram.", highlights: "East Coast Road scenic views, Mahabalipuram stop option, Pondicherry White Town walk, Auroville visit", bestTime: "October to March", img: "/places/pondicherry_french_quarter.png", imgs: ["/places/pondicherry_french_quarter.png"], price: "₹499" },
    { id: "mysore_bus", type: "buses", state: "Karnataka", title: "Bengaluru to Mysore Royal", desc: "Luxury AC bus to the heritage city of palaces.", details: "The Bengaluru to Mysore premium bus service covers 145 km in about 3 hours. Mysore is famous for its stunning Mysore Palace, silk weaving, sandalwood products, and the world-famous Dasara festival celebrations.", highlights: "Mysore Palace illumination visit, Brindavan Gardens water fountain, Chamundi Hills temple trek, Silk weaving unit tour", bestTime: "September to February", img: "/places/mysore_palace.png", imgs: ["/places/mysore_palace.png"], price: "₹799" },

    // ── Cruise ───────────────────────────────────────────────────────────────
    { id: "lakshadweep", type: "cruise", state: "Lakshadweep", title: "Lakshadweep Explorer", desc: "Cruise through pristine lagoons and coral reefs.", details: "Embark on a luxury cruise to the pristine islands of Lakshadweep. Discover turquoise blue waters, rich marine life, white sand beaches, and coral reefs through snorkeling, kayaking, and glass-bottom boat tours.", highlights: "Snorkeling and scuba diving, Coral reef view tours, Kayaking in blue lagoons, Shipboard dining", bestTime: "October to May", img: "/places/lakshadweep_cruise.png", imgs: ["/places/lakshadweep_cruise.png", "/places/lakshadweep_beach.png"], price: "₹18,500" },
    { id: "goa_cruise", type: "cruise", state: "Goa", title: "Goa Sunset River Cruise", desc: "Sail along the Mandovi River watching the golden Goa sunset.", details: "The famous Mandovi River cruise in Goa features live Goan folk music, traditional Dekhni dance performances, and breathtaking views of the Fort Aguada and Old Goa churches as the sun sets over the Arabian Sea.", highlights: "Live Goan folk music and dance, Sunset views over Fort Aguada, Old Goa riverside vistas, Open-deck cocktail bar", bestTime: "October to April", img: "/places/goa_mandovi_cruise.png", imgs: ["/places/goa_mandovi_cruise.png", "/places/goa_sunset.png"], price: "₹4,500" },
    { id: "kerala_cruise", type: "cruise", state: "Kerala", title: "Kerala Backwater Luxury Cruise", desc: "An overnight luxury houseboat through Kerala's serene backwaters.", details: "Kerala's Kettuvallam (rice boat) cruise is an unforgettable experience through the Vembanad Lake and Alleppey backwaters. These premium houseboats feature air-conditioned cabins, sun decks, and on-board chefs serving authentic Kerala cuisine.", highlights: "Overnight houseboat cruise, Authentic Kerala meals on board, Village life views, Fishing net demonstrations", bestTime: "September to March", img: "/places/kerala_houseboat.png", imgs: ["/places/kerala_houseboat.png"], price: "₹9,800" },
    { id: "rameshwaram_cruise", type: "cruise", state: "Tamil Nadu", title: "Rameshwaram Island Cruise", desc: "Experience the sacred Pamban strait and Gulf of Mannar waters.", details: "Take a scenic boat cruise from Rameshwaram to explore the Pamban strait and the waters of the Gulf of Mannar Marine National Park. Spot dolphins, sea turtles, and vibrant coral reefs in one of India's most biodiverse marine zones.", highlights: "Dolphin and turtle sightings, Gulf of Mannar coral reefs, Pamban Bridge views from water, Dhanushkodi approach by boat", bestTime: "October to April", img: "/places/rameshwaram_pamban.png", imgs: ["/places/rameshwaram_pamban.png"], price: "₹6,200" },

    // ── Tours ────────────────────────────────────────────────────────────────
    { id: "ajanta", type: "tours", state: "Maharashtra", title: "Ajanta & Ellora Caves", desc: "Explore ancient rock-cut Buddhist and Hindu monuments.", details: "Witness the spectacular 30 rock-cut Buddhist cave monuments of Ajanta and 34 caves of Ellora, dating from the 2nd century BCE to the 10th century CE. The magnificent Kailash Temple in Ellora is a engineering marvel.", highlights: "Kailash Temple (Ellora), Ancient rock-cut murals, Buddhist monastery carvings, Archaeological museum tour", bestTime: "November to March", img: "/places/ajanta_caves.png", imgs: ["/places/ajanta_caves.png"], duration: "2 Days" },
    { id: "madurai_tn_tour", type: "tours", state: "Tamil Nadu", title: "Madurai (The Temple City)", desc: "Explore the architectural grandeur of Meenakshi Amman Temple.", details: "Madurai is one of India's oldest continuously inhabited cities. Built around the historic Meenakshi Amman Temple, it is renowned for its vibrant festival celebrations, incredible gopuram carvings, and flavorful local culinary heritage.", highlights: "Meenakshi Temple tour, Tirumalai Nayakkar Palace light show, Shopping for Madurai Sungudi sarees, Local street food tour", bestTime: "October to March", img: "/places/madurai_temple.png", imgs: ["/places/madurai_temple.png"], price: "₹1,499" },
    { id: "mahabalipuram_tn_tour", type: "tours", state: "Tamil Nadu", title: "Mahabalipuram Shore", desc: "Gaze upon UNESCO-listed rock temples by the Bay of Bengal.", details: "Mahabalipuram is a historic town known for its UNESCO-listed group of Pallava monuments. Located on the coast of the Bay of Bengal, the Shore Temple, Five Rathas, and detailed rock carvings are breathtaking engineering feats of the 7th century.", highlights: "Shore Temple sunset walk, Five Rathas rock carvings, Arjuna's Penance relief, Beachside seafood dining", bestTime: "November to February", img: "/places/mahabalipuram_shore.png", imgs: ["/places/mahabalipuram_shore.png"], price: "₹999" },
    { id: "rameshwaram_tn_tour", type: "tours", state: "Tamil Nadu", title: "Rameshwaram Island", desc: "Journey across the sea bridge to the holy island.", details: "Rameshwaram is a holy town located on Pamban Island, connected to mainland India by the spectacular Pamban sea bridge. It is home to the Ramanathaswamy Temple, featuring the longest corridor of any Hindu temple in the world.", highlights: "Pamban Bridge crossing, Ramanathaswamy Temple corridor, Dhanushkodi ghost town exploration, Agnitheertham holy bath", bestTime: "October to March", img: "/places/rameshwaram_pamban.png", imgs: ["/places/rameshwaram_pamban.png"], price: "₹2,199" },
    { id: "jaipur_tour", type: "tours", state: "Rajasthan", title: "Jaipur Royal Heritage Tour", desc: "A guided journey through Jaipur's most iconic royal monuments.", details: "This curated 2-day heritage tour of Jaipur covers all the iconic royal landmarks: the grand Amber Fort with its stunning Sheesh Mahal (mirror palace), the iconic Hawa Mahal, City Palace museum, Jantar Mantar astronomical observatory, and bustling bazaars.", highlights: "Amber Fort elephant ride, Hawa Mahal photography, Jantar Mantar observatory, Johari Bazaar gem shopping", bestTime: "October to March", img: "/places/jaipur_amber_fort.png", imgs: ["/places/jaipur_amber_fort.png"], duration: "2 Days" },
    { id: "delhi_tour", type: "tours", state: "Delhi", title: "Delhi Heritage & Modern Walk", desc: "From Mughal monuments to Lutyens' Delhi in one epic tour.", details: "Explore Delhi's rich 3,000-year history across Old Delhi and New Delhi. Visit the magnificent Red Fort, Jama Masjid, Qutub Minar (UNESCO), India Gate, Humayun's Tomb, and the peaceful Lodhi Garden in a curated full-day tour.", highlights: "Red Fort sound and light show, Qutub Minar UNESCO visit, India Gate sunset, Chandni Chowk street food tour", bestTime: "October to March", img: "/places/delhi_red_fort.png", imgs: ["/places/delhi_red_fort.png", "/places/delhi_imperial.png"], duration: "1 Day" },
    { id: "mysore_tour", type: "tours", state: "Karnataka", title: "Mysore Palace & Coorg Day Tour", desc: "Explore the royal opulence of Mysore Palace and misty Coorg.", details: "This combined Mysore and Coorg tour covers the stunning Mysore Palace (illuminated with 97,000 bulbs on Sundays), Chamundi Hills temple, Brindavan Gardens, and then the lush coffee estates of Coorg.", highlights: "Mysore Palace Sunday illumination, Brindavan Gardens fountain display, Chamundi Hills trek, Coorg coffee plantation visit", bestTime: "September to February", img: "/places/mysore_palace.png", imgs: ["/places/mysore_palace.png", "/places/coorg_plantation.png"], duration: "2 Days" },
    { id: "kashi_tour", type: "tours", state: "Uttar Pradesh", title: "Kashi Vishwanath Pilgrimage", desc: "Follow the ancient spiritual path to Lord Shiva's holiest temple.", details: "Kashi (Varanasi) Vishwanath Temple is one of the most sacred Hindu temples, dedicated to Lord Shiva. The newly built Kashi Vishwanath Corridor provides a magnificent approach to the temple with stunning views of the Ganges and the ancient city.", highlights: "Kashi Vishwanath temple darshan, Ganga Aarti ceremony at Dashashwamedh Ghat, Sacred Ghats boat tour, Banaras Hindu University campus visit", bestTime: "October to March", img: "/places/kashi_vishwanath.png", imgs: ["/places/kashi_vishwanath.png", "/places/varanasi_ghat.png"], duration: "2 Days" }
  ];

  const nav = useNavigate();



  function search(e: React.FormEvent) {
    e.preventDefault();
    const d = String(date || "");
    const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    const iso = m ? `${m[3]}-${m[2]}-${m[1]}` : d;

    // Include specialFare so SearchResults and FlightDetail can apply the right discount
    let queryParams = `origin=${origin}&destination=${destination}&date=${iso}&tripType=${tripType}&specialFare=${selectedSpecialFare}`;
    if (tripType === "roundtrip") {
      const rd = String(returnDate || "");
      const rm = rd.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      const isoReturn = rm ? `${rm[3]}-${rm[2]}-${rm[1]}` : rd;
      queryParams += `&returnDate=${isoReturn}`;
    }
    nav(`/search?${queryParams}`);
  }

  const today = new Date().toISOString().split('T')[0];

  const getAirportName = (code: string) => {
    const mapping: Record<string, string> = {
      DEL: "New Delhi, Indira Gandhi Intl Airport",
      BOM: "Mumbai, Chhatrapati Shivaji Maharaj Airport",
      BLR: "Bengaluru, Kempegowda Airport",
      MAA: "Chennai International Airport",
      CCU: "Kolkata, Netaji Bose Airport",
      HYD: "Hyderabad, Rajiv Gandhi Airport",
      PNQ: "Pune Airport",
      AMD: "Ahmedabad Airport",
      GOI: "Goa, Dabolim Airport",
      COK: "Kochi, Cochin Airport",
      JAI: "Jaipur Airport",
      MYS: "Mysore Airport"
    };
    return mapping[code.toUpperCase()] || "Airport, India";
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return { day: "--", monthYear: "Select Date", weekday: "" };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: "--", monthYear: "Select Date", weekday: "" };
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: 'short' });
    const year = d.toLocaleDateString("en-US", { year: 'numeric' });
    const monthYear = `${month}' ${year.slice(-2)}`;
    const weekday = d.toLocaleDateString("en-US", { weekday: 'long' });
    return { day, monthYear, weekday };
  };

  /**
   * SPECIAL FARES — Actual airline concession structure used in India
   *
   * Discount percentages are based on real airline concession programmes:
   * - Student: IndiGo/Air India offer 5-10% off + extra 10 kg baggage
   * - Armed Forces (CSD quota): 50% discount on base fare across major carriers
   * - Senior Citizen (60+ years): 50% off on Air India; IndiGo/SpiceJet 7-10%
   *   — we use a conservative 10% to be cross-carrier realistic
   * - GST Business: No fare discount but full ITC on GST component;
   *   modelled here as 5% effective reduction + corporate invoice
   * - Regular: No concession (baseline)
   *
   * discountPct: percentage taken off basePriceCents before display
   * extraBaggage: extra free checked-in baggage (kg)
   * perks: UI description of what the traveller gets
   */
  const specialFaresOptions = [
    {
      id: "regular",
      icon: "✈️",
      title: "Regular",
      subtitle: "Standard fares",
      badge: null,
      discountPct: 0,
      extraBaggage: 0,
      perks: "Standard fare — no special concession applied."
    },
    {
      id: "student",
      icon: "🎓",
      title: "Student",
      subtitle: "Up to 10% off",
      badge: "Student",
      discountPct: 10,
      extraBaggage: 10,
      perks: "10% off base fare + extra 10 kg free checked-in baggage. Valid ID required at airport."
    },
    {
      id: "armed",
      icon: "🎖️",
      title: "Armed Forces",
      subtitle: "Up to 50% off",
      badge: "Defence",
      discountPct: 50,
      extraBaggage: 15,
      perks: "50% off base fare + extra 15 kg baggage. CSD quota — valid Defence ID mandatory."
    },
    {
      id: "senior",
      icon: "🧓",
      title: "Senior Citizen",
      subtitle: "Up to 10% off",
      badge: "60+ Yrs",
      discountPct: 10,
      extraBaggage: 0,
      perks: "10% off base fare for passengers aged 60 years and above. Govt-issued age proof required."
    },
    {
      id: "gst",
      icon: "🏢",
      title: "GST Business",
      subtitle: "Save 5% + ITC",
      badge: "Corporate",
      discountPct: 5,
      extraBaggage: 0,
      perks: "5% effective saving via full GST Input Tax Credit. Tax invoice issued. Valid GSTIN required."
    }
  ];

  const tabs = [
    { id: "flights", label: "Flights", l1: "Book", l2: "Flights", searchLabel: "Search Flights" },
    { id: "hotels", label: "Hotels", l1: "Book", l2: "Hotels", searchLabel: "Search Hotels" },
    { id: "homestays", label: "Villas & Homestays", l1: "Villas &", l2: "Homestays", searchLabel: "Search Homestays" },
    { id: "holidays", label: "Holiday Packages", l1: "Holiday", l2: "Packages", searchLabel: "Search Holidays" },
    { id: "trains", label: "Trains", l1: "Book", l2: "Trains", searchLabel: "Search Trains" },
    { id: "buses", label: "Buses", l1: "Book", l2: "Buses", searchLabel: "Search Buses" },
    { id: "cabs", label: "Cabs", l1: "Book", l2: "Cabs", searchLabel: "Search Cabs" },
    { id: "tours", label: "Tours & Attractions", l1: "Tours &", l2: "Attractions", searchLabel: "Search Tours" },
    { id: "cruise", label: "Cruise", l1: "Book", l2: "Cruise", searchLabel: "Search Cruises", badge: "new" },
    { id: "insurance", label: "Travel Insurance", l1: "Travel", l2: "Insurance", searchLabel: "Search Insurance" }
  ];

  const renderTabIcon = (id: string, className: string) => {
    switch (id) {
      case "flights": return <FlightIcon className={className} />;
      case "hotels": return <HotelIcon className={className} />;
      case "homestays": return <VillaIcon className={className} />;
      case "holidays": return <HolidayIcon className={className} />;
      case "trains": return <TrainIcon className={className} />;
      case "buses": return <BusIcon className={className} />;
      case "cabs": return <CabIcon className={className} />;
      case "tours": return <ToursIcon className={className} />;
      case "visa": return <VisaIcon className={className} />;
      case "cruise": return <CruiseIcon className={className} />;
      case "forex": return <ForexIcon className={className} />;
      case "insurance": return <InsuranceIcon className={className} />;
      default: return <FlightIcon className={className} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans">
      <div className="relative z-10">
        <Header />

        {/* ── Hero Banner ───────────────────────────────────────────────────
            Full-width background image with an overlay for text readability.
            pb-36 gives space for the floating search panel to overlap below. */}
        <div
          className="relative bg-cover bg-center text-white pt-10 pb-36 px-4"
          style={{ backgroundImage: "url('/travel_hero_bg.png')" }}
        >
          {/* Overlay: lighter in light mode, very dark in dark mode */}
          <div className="absolute inset-0 bg-[#18181b]/40 dark:bg-[#09090b]/80 z-0"></div>

          <div className="container max-w-6xl mx-auto text-center relative z-10">
            {/* text-3xl on phones, scales up to 5xl on desktop */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              Compare & Book Flights Easily
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto font-medium">
              Save big with AI-powered flight recommendations & exclusive discounts.
            </p>
          </div>
        </div>

        {/* ── Main Search Panel ─────────────────────────────────────────────
            Floats up over the hero banner with -mt-24.
            Contains the tab nav and the active tab's search form.           */}
        <div className="container max-w-6xl mx-auto -mt-24 px-4 relative z-20">

          {/* ── Category Tab Navigation ───────────────────────────────────
              Responsive grid: 2 cols on tiny phones, 3 on 400px+, 5 on sm,
              10 cols on lg. Each tab shows a tiny icon + two lines of text.
              Active tab gets a blue bottom indicator bar.                   */}
          {/* overflow-visible is critical here — combined with the portal Tooltip
              this ensures tooltip bubbles are never clipped by the grid container
              on any screen size, including small 6-inch mobile phones.          */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-xl rounded-3xl mb-6 w-full flex overflow-x-auto lg:grid lg:grid-cols-10 select-none px-4 py-3.5 relative z-30 gap-x-5 sm:gap-x-6 lg:gap-x-3 gap-y-3.5 overflow-y-visible lg:overflow-visible scrollbar-none snap-x snap-mandatory">
            {tabs.map((tab: any) => {
              const isActive = activeTab === tab.id;
              const tooltipLabel = tab.disabled
                ? `Coming Soon: ${tab.label}`
                : `Search ${tab.label}`;
              return (
                // Tooltip wraps the button and renders its bubble via ReactDOM.createPortal
                // so the label is always on top of every nav key on all screen sizes.
                <Tooltip key={tab.id} label={tooltipLabel} direction="below">
                  <button
                    disabled={tab.disabled}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-col items-center justify-center py-2 px-1 text-center transition-all duration-200 outline-none rounded-2xl group snap-start shrink-0 min-w-[76px] lg:min-w-0 w-auto lg:w-full ${isActive
                      ? "text-[#008cff] font-extrabold scale-105"
                      : "text-gray-550 dark:text-gray-400 hover:text-[#008cff] dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                  >
                    {tab.badge && (
                      <span className="absolute top-0 right-0 md:right-2 bg-[#d946ef] text-white text-[7px] md:text-[8px] font-extrabold px-1 py-0.2 md:px-1.5 md:py-0.5 uppercase tracking-wide rounded-full shadow-sm scale-90 select-none animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                    <div className={`flex items-center justify-center mb-1 p-1.5 md:p-2 rounded-full transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-955/40 text-[#008cff]" : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-955/20 group-hover:text-[#008cff]"}`}>
                      {renderTabIcon(tab.id, "w-5 h-5 md:w-6 md:h-6")}
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider leading-tight block whitespace-normal w-full px-0.5">
                      {tab.l1}
                    </span>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider leading-tight block whitespace-normal w-full px-0.5">
                      {tab.l2}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-10 h-0.5 md:h-1 bg-[#008cff] rounded-full"></span>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/70 dark:border-gray-800/80 p-6 md:p-8 animate-scale-in relative z-20">



            {/* Trip Type Select Row */}
            <div className="flex items-center justify-between gap-6 mb-6 pb-4 border-b border-gray-150 dark:border-gray-800">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="triptype"
                    checked={tripType === "oneway"}
                    onChange={() => setTripType("oneway")}
                    className="w-4.5 h-4.5 text-[#008cff] focus:ring-[#008cff] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-850"
                  />
                  <span className={`text-sm font-bold tracking-wide transition-colors ${tripType === "oneway" ? "text-[#008cff]" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
                    ONE WAY
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="triptype"
                    checked={tripType === "roundtrip"}
                    onChange={() => setTripType("roundtrip")}
                    className="w-4.5 h-4.5 text-[#008cff] focus:ring-[#008cff] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-850"
                  />
                  <span className={`text-sm font-bold tracking-wide transition-colors ${tripType === "roundtrip" ? "text-[#008cff]" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>
                    ROUND TRIP
                  </span>
                </label>
              </div>
              <div className="hidden md:block text-xs font-bold text-gray-405 dark:text-gray-505 uppercase tracking-wider">
                Book Domestic & International Flights
              </div>
            </div>

            {/* Manual Flight Search Form */}
            <form id="search-form" onSubmit={search} className="relative">
              {/* Search Form Fields Grid */}
              {activeTab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-5 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-visible md:overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From & To Combo with Swap Button */}
                  <div className="md:col-span-2 relative flex flex-col md:grid md:grid-cols-2 divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 md:border-0 rounded-2xl md:rounded-none overflow-visible">
                    {/* From Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[100px] border-b border-gray-200 dark:border-gray-800 md:border-b-0 md:border-r relative">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">FROM</span>
                      <input
                        type="text"
                        value={originInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOriginInput(val);
                          const resolved = resolveAirport(val);
                          if (resolved) setOrigin(resolved);
                        }}
                        onFocus={() => setShowOriginSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowOriginSuggestions(false);
                            const resolved = resolveAirport(originInput);
                            if (resolved) {
                              setOrigin(resolved);
                              setOriginInput(resolved);
                            } else {
                              setOriginInput(origin);
                            }
                          }, 200);
                        }}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="DEL"
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold" title={getAirportName(origin)}>
                        {getAirportName(origin)}
                      </span>

                      {/* Autocomplete suggestions */}
                      {showOriginSuggestions && (
                        <div className="absolute left-0 right-0 top-[100%] mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                          {getSuggestions(originInput).map((airport) => (
                            <div
                              key={airport.code}
                              onPointerDown={() => {
                                setOrigin(airport.code);
                                setOriginInput(airport.code);
                                setShowOriginSuggestions(false);
                              }}
                              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-955/20 cursor-pointer flex items-center justify-between border-b border-gray-100 dark:border-gray-800/40 last:border-b-0"
                            >
                              <div>
                                <div className="text-sm font-bold text-gray-800 dark:text-white">
                                  {airport.city}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {airport.name}
                                </div>
                              </div>
                              <span className="text-xs font-extrabold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                                {airport.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mobile Swap Row — shown only on mobile between FROM and TO */}
                    <div className="flex md:hidden items-center justify-center py-2 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-[#008cff] shadow-md flex items-center justify-center text-[#008cff] active:scale-90 transition-all duration-200"
                        title="Swap airports"
                      >
                        <span className="text-xl font-bold leading-none">⇄</span>
                      </button>
                    </div>

                    {/* To Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[100px] relative">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">TO</span>
                      <input
                        type="text"
                        value={destinationInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDestinationInput(val);
                          const resolved = resolveAirport(val);
                          if (resolved) setDestination(resolved);
                        }}
                        onFocus={() => setShowDestSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowDestSuggestions(false);
                            const resolved = resolveAirport(destinationInput);
                            if (resolved) {
                              setDestination(resolved);
                              setDestinationInput(resolved);
                            } else {
                              setDestinationInput(destination);
                            }
                          }, 200);
                        }}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="BOM"
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold" title={getAirportName(destination)}>
                        {getAirportName(destination)}
                      </span>

                      {/* Autocomplete suggestions */}
                      {showDestSuggestions && (
                        <div className="absolute left-0 right-0 top-[100%] mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                          {getSuggestions(destinationInput).map((airport) => (
                            <div
                              key={airport.code}
                              onPointerDown={() => {
                                setDestination(airport.code);
                                setDestinationInput(airport.code);
                                setShowDestSuggestions(false);
                              }}
                              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-955/20 cursor-pointer flex items-center justify-between border-b border-gray-100 dark:border-gray-800/40 last:border-b-0"
                            >
                              <div>
                                <div className="text-sm font-bold text-gray-800 dark:text-white">
                                  {airport.city}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {airport.name}
                                </div>
                              </div>
                              <span className="text-xs font-extrabold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                                {airport.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Desktop Swap Button — absolute centre between FROM and TO */}
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="hidden md:flex absolute z-30 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-[#008cff] shadow-md hover:shadow-lg items-center justify-center text-[#008cff] hover:bg-blue-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer active:scale-90 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      title="Swap airports"
                    >
                      <span className="text-lg font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Departure Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">DEPARTURE</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Return Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    const isOneWay = tripType === "oneway";
                    return (
                      <div
                        onClick={() => {
                          if (isOneWay) setTripType("roundtrip");
                        }}
                        className={`bg-white dark:bg-gray-900 p-5 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px] ${isOneWay
                            ? "hover:bg-blue-50/10 dark:hover:bg-blue-955/5"
                            : "hover:bg-blue-50/20 dark:hover:bg-blue-955/10"
                          }`}
                      >
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">RETURN</span>
                        {isOneWay ? (
                          <>
                            <span className="text-xl font-extrabold text-[#008cff] mt-1">+ Add RETURN</span>
                            <span className="block text-xs text-gray-450 dark:text-gray-555 mt-1 font-semibold">
                              Tap to book round-trip
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                              <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                            </div>
                            <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                            <input
                              type="date"
                              value={returnDate}
                              min={date || today}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                              required={tripType === "roundtrip"}
                            />
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Travelers Info */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">TRAVELERS</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="1"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Traveler(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Economy Class
                    </span>
                  </div>
                </div>
              )}

              {/* ── Consolidated Special Fares — Premium Glassmorphism Module ───────────── */}
              {activeTab === "flights" && (
                <div className="bg-white/30 dark:bg-gray-900/40 backdrop-blur-lg border border-white/20 dark:border-gray-800/30 shadow-xl rounded-3xl p-5 sm:p-6 mt-6 mb-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">Special Fares</span>
                    {selectedSpecialFare !== "regular" && (
                      <span className="text-[9px] bg-green-500/10 text-green-600 dark:text-green-400 font-extrabold px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse shrink-0">
                        Discount Applied ✓
                      </span>
                    )}
                  </div>

                  {/* Responsive grid of glass buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {specialFaresOptions.map((fare) => {
                      const isActive = selectedSpecialFare === fare.id;
                      return (
                        <button
                          key={fare.id}
                          type="button"
                          onClick={() => setSelectedSpecialFare(fare.id)}
                          className={`flex flex-col justify-between p-3.5 border rounded-2xl transition-all duration-300 text-left relative backdrop-blur-sm cursor-pointer h-full min-h-[90px] ${
                            isActive
                              ? "border-booking-lightblue bg-booking-lightblue/10 text-booking-lightblue dark:text-blue-400 font-extrabold scale-[1.02] shadow-md shadow-blue-500/5"
                              : "bg-white/40 dark:bg-gray-850/20 border-white/30 dark:border-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/40 hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          {fare.badge && (
                            <span className="absolute -top-2 right-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md scale-90">
                              {fare.badge}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base leading-none">{fare.icon}</span>
                            <span className="text-xs font-extrabold font-sans leading-tight">{fare.title}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-tight">{fare.subtitle}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Glassmorphic perks description */}
                  {selectedSpecialFare !== "regular" && (() => {
                    const fare = specialFaresOptions.find(f => f.id === selectedSpecialFare)!;
                    return (
                      <div className="flex items-start gap-3 bg-green-500/5 dark:bg-green-950/20 border border-green-500/20 dark:border-green-800/30 rounded-2xl p-4 mt-4 animate-slide-down">
                        <span className="text-xl mt-0.5 shrink-0">{fare.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-xs font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wide">{fare.title} Fare</span>
                            <span className="text-[9px] font-extrabold bg-green-500 text-white px-2 py-0.5 rounded-full shrink-0">{fare.subtitle}</span>
                            {fare.extraBaggage > 0 && (
                              <span className="text-[9px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-400/20 shrink-0">
                                +{fare.extraBaggage}kg Free Baggage
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-green-700/80 dark:text-green-400/70 font-semibold leading-relaxed break-words">{fare.perks}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "hotels" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* City/Location */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">City, Property or Location</span>
                    <input
                      type="text"
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Delhi, India"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">India</span>
                  </div>

                  {/* Check-In Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-In Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Check-Out Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-Out Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                        <input
                          type="date"
                          value={returnDate}
                          min={date || today}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Rooms & Guests */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Rooms & Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="1"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Guest(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      1 Room / Deluxe Class
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "homestays" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* City/Location */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">City, Locality or Villa Name</span>
                    <input
                      type="text"
                      value={homestayCity}
                      onChange={(e) => setHomestayCity(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Coorg, Karnataka"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Karnataka</span>
                  </div>

                  {/* Check-In Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-In Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Check-Out Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-Out Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                        <input
                          type="date"
                          value={returnDate}
                          min={date || today}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Guests */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="2"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Guest(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Entire Villa / Homestay
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "holidays" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From City */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">From City</span>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="DEL"
                      maxLength={3}
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">New Delhi, India</span>
                  </div>

                  {/* To Destination */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">To Destination / Package</span>
                    <input
                      type="text"
                      value={holidayDest}
                      onChange={(e) => setHolidayDest(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Goa, India"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">India</span>
                  </div>

                  {/* Departure Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Departure Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Travelers */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="2"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Traveler(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Flights + Hotel Package
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "trains" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From & To Combo with Floating Swap Button */}
                  <div className="md:col-span-2 relative flex flex-col md:grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                    {/* From Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">From Station</span>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-850 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="DEL"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        New Delhi Station
                      </span>
                    </div>

                    {/* To Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">To Station</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="BOM"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        Mumbai Central
                      </span>
                    </div>

                    {/* Mobile Swap Row for Trains */}
                    <div className="flex md:hidden items-center justify-center py-2 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-[#008cff] shadow-md flex items-center justify-center text-[#008cff] active:scale-90 transition-all duration-200"
                        title="Swap Stations"
                      >
                        <span className="text-xl font-bold leading-none">⇄</span>
                      </button>
                    </div>
                    {/* Desktop Swap Button for Trains */}
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="hidden md:flex absolute z-30 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-[#008cff] shadow-md hover:shadow-lg items-center justify-center text-[#008cff] hover:bg-blue-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer active:scale-90 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      title="Swap Stations"
                    >
                      <span className="text-lg font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Travel Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Travel Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Class */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Class & Quota</span>
                    <span className="block text-xl font-extrabold text-gray-855 dark:text-white mt-1">All Classes</span>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      General Quota (GN)
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "buses" && (
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* From & To Combo with Floating Swap Button */}
                  <div className="md:col-span-2 relative flex flex-col md:grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                    {/* From Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">From City</span>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-850 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="DEL"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        Delhi, India
                      </span>
                    </div>

                    {/* To Field */}
                    <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-55/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">To City</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                        placeholder="BOM"
                        maxLength={3}
                        required
                      />
                      <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 truncate max-w-full font-semibold">
                        Mumbai, India
                      </span>
                    </div>

                    {/* Mobile Swap Row for Buses */}
                    <div className="flex md:hidden items-center justify-center py-2 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-[#008cff] shadow-md flex items-center justify-center text-[#008cff] active:scale-90 transition-all duration-200"
                        title="Swap Cities"
                      >
                        <span className="text-xl font-bold leading-none">⇄</span>
                      </button>
                    </div>
                    {/* Desktop Swap Button for Buses */}
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="hidden md:flex absolute z-30 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-[#008cff] shadow-md hover:shadow-lg items-center justify-center text-[#008cff] hover:bg-blue-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer active:scale-90 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      title="Swap Cities"
                    >
                      <span className="text-lg font-bold">⇄</span>
                    </button>
                  </div>

                  {/* Travel Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Travel Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "cabs" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Pick-Up City */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Pick-Up City</span>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="DEL"
                      maxLength={3}
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Delhi, India</span>
                  </div>

                  {/* Drop-Off City */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Drop-Off City</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="BOM"
                      maxLength={3}
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Mumbai, India</span>
                  </div>

                  {/* Pickup Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Pickup Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Pickup Time */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px] relative">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Pickup Time</span>
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none"
                      placeholder="10:00 AM"
                      required
                    />
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Outstation Oneway
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "tours" && (
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Destination/Attraction */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Destination / Attraction</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Agra, Taj Mahal"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Activities & Day Trips</span>
                  </div>

                  {/* Visit Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Visit Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Tickets */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Tickets / Guests</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="1"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Ticket(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Standard Entry Access
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "cruise" && (
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Destination */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Cruise Destination</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Lakshadweep Islands"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">India Cruising</span>
                  </div>

                  {/* Departure Month / Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Departure Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Guests & Cabins */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests & Cabins</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="2"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Guest(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      1 Cabin / Oceanview
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "insurance" && (
                <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 mb-6">
                  {/* Destination Country */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer group flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Destination Country</span>
                    <input
                      type="text"
                      value={insuranceCountry}
                      onChange={(e) => setInsuranceCountry(e.target.value)}
                      className="w-full bg-transparent font-extrabold text-2xl text-gray-855 dark:text-white outline-none placeholder-gray-400 group-hover:text-[#008cff] dark:group-hover:text-blue-400 transition-colors"
                      placeholder="Thailand"
                      required
                    />
                    <span className="block text-xs text-gray-550 dark:text-gray-400 mt-1 font-semibold">Global Coverage</span>
                  </div>

                  {/* Start Date */}
                  {(() => {
                    const displayDate = formatDateDisplay(date);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Trip Start Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayDate.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayDate.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayDate.weekday}</span>
                        <input
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* End Date */}
                  {(() => {
                    const displayReturn = formatDateDisplay(returnDate);
                    return (
                      <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[110px]">
                        <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Trip End Date</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-gray-800 dark:text-white leading-none">{displayReturn.day}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{displayReturn.monthYear}</span>
                        </div>
                        <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">{displayReturn.weekday}</span>
                        <input
                          type="date"
                          value={returnDate}
                          min={date || today}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          required
                        />
                      </div>
                    );
                  })()}

                  {/* Travelers Age */}
                  <div className="bg-white dark:bg-gray-900 p-5 hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors cursor-pointer flex flex-col justify-center min-h-[110px]">
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Traveler's Age</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={travelers}
                        min={1}
                        max={9}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setTravelers("");
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setTravelers(Math.max(1, Math.min(9, parsed)));
                            }
                          }
                        }}
                        className="w-12 bg-transparent font-extrabold text-3xl text-gray-855 dark:text-white outline-none"
                        placeholder="25"
                        required
                      />
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Traveler(s)</span>
                    </div>
                    <span className="block text-xs text-gray-555 dark:text-gray-400 mt-1 font-semibold">
                      Schengen & Worldwide Approved
                    </span>
                  </div>
                </div>
              )}



            </form>
          </div>

          {/* SEARCH BUTTON (Centered below the ticket options box) */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                const formEl = document.getElementById("search-form") as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              className="w-full sm:w-auto px-8 sm:px-16 py-4 text-sm sm:text-lg bg-gradient-to-r from-[#008cff] to-[#007cdb] hover:from-[#007cdb] hover:to-[#006cc7] text-white font-extrabold rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 flex items-center justify-center gap-2 group tracking-wider uppercase sm:min-w-[240px]"
            >
              <span>{tabs.find((t) => t.id === activeTab)?.searchLabel || "Search"}</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-200">➔</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="container max-w-6xl mx-auto pt-16 pb-20 px-4">
          {/* Places to Visit Section */}
          <div className="mb-16 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-booking-lightblue/10 text-booking-lightblue border border-booking-lightblue/20">
                  Explore Destinations
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 font-display tracking-tight">
                  {activeTab === "flights" && "Popular Places to Visit"}
                  {activeTab === "hotels" && "Featured Luxury Hotels"}
                  {activeTab === "homestays" && "Scenic Villas & Homestays"}
                  {activeTab === "buses" && "Popular Bus Routes"}
                  {activeTab === "cruise" && "Stunning Cruise Voyages"}
                  {activeTab === "tours" && "Top Tours & Attractions"}
                </h3>
              </div>
            </div>

            {/* Search and Filters Area */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-[#faf8f5]/60 dark:bg-gray-900/60 p-4 border border-gray-200/50 dark:border-gray-800/50 items-center justify-between">
                  {/* Text Search */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by state or place name..."
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm outline-none text-gray-855 dark:text-white"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                  </div>

                  {/* State Dropdown */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Filter by State:
                    </span>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-855 border border-gray-300 dark:border-gray-700 text-sm outline-none text-gray-855 dark:text-white w-full sm:w-56"
                    >
                      <option value="all">All States</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Goa">Goa</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </div>
                </div>

                {/* Places Grid with w-80 sized cards */}
                {(() => {
                  const filteredPlaces = allPlaces.filter((place) => {
                    const matchesCategory = place.type === activeTab;
                    const matchesState = selectedState === "all" || place.state === selectedState;

                    const matchesQuery =
                      isFuzzyMatch(place.title, searchQuery) ||
                      isFuzzyMatch(place.desc, searchQuery) ||
                      isFuzzyMatch(place.state, searchQuery);

                    return matchesCategory && matchesState && matchesQuery;
                  });

                  if (filteredPlaces.length === 0) {
                    return (
                      <div className="text-center py-12 bg-white dark:bg-gray-850 border border-gray-200/50 dark:border-gray-800/50 w-full">
                        <p className="text-sm font-bold text-gray-500">No matching flights found</p>
                        <button
                          onClick={() => {
                            setSelectedState("all");
                            setSearchQuery("");
                          }}
                          className="mt-3 text-xs font-bold text-booking-lightblue underline hover:text-booking-lightblue/80"
                        >
                          Reset Search Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                      {filteredPlaces.map((place: any, index: number) => (
                        <div
                          key={index}
                          onClick={() => setSelectedExplorePlace(place)}
                          className="shrink-0 w-full max-w-[340px] sm:w-80 h-[390px] bg-white dark:bg-gray-855 dark:border-gray-750/60 border border-gray-150 rounded-3xl shadow-md overflow-hidden hover:shadow-xl hover:border-booking-lightblue/25 transition-all duration-300 flex flex-col cursor-pointer group"
                        >
                          {/* Place Image */}
                          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900 group/img">
                            <button
                              onClick={(e) => toggleWishlistPlace(e, place)}
                              className="absolute top-3 right-3 z-20 p-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white/90 dark:hover:bg-gray-700/90 text-gray-100 hover:text-red-500 transition-all focus:outline-none flex items-center justify-center shadow-md rounded-full backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 group-hover/img:opacity-100"
                              aria-label="Add to Wishlist"
                            >
                              <HeartIcon className={`w-5 h-5 ${isPlaceWishlisted(place) ? "text-red-500 fill-current scale-110 opacity-100" : "text-white"} transition-all duration-200`} />
                            </button>
                            <img
                              src={place.img}
                              alt={place.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              decoding="async"
                            />
                            {place.price && (
                              <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider">
                                Starting From {place.price}
                              </div>
                            )}
                            {place.rating && (
                              <div className="absolute bottom-3 left-3 bg-amber-500 text-gray-950 text-[10px] font-extrabold px-2.5 py-1 tracking-wider uppercase">
                                {place.rating}
                              </div>
                            )}
                            {place.durationKey && (
                              <div className="absolute bottom-3 left-3 bg-booking-lightblue text-white text-[10px] font-extrabold px-2.5 py-1 tracking-wider uppercase">
                                {place.duration}
                              </div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-extrabold text-gray-855 dark:text-white uppercase tracking-wider">{place.title}</h4>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
                                  {place.state}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-semibold mt-1">
                                {place.desc}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExplorePlace(place);
                              }}
                              className="w-full text-center py-2 bg-gray-50 dark:bg-gray-750 hover:bg-booking-lightblue hover:text-white text-[10px] font-extrabold text-booking-lightblue uppercase tracking-wider transition-colors duration-250 border-t border-gray-100 dark:border-gray-700/60"
                            >
                              Explore Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
          </div>

          {/* Quick Chat Widget Area & Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Assistant Chat Banner */}
            <div className="lg:col-span-2 bg-[#f0f7ff] dark:bg-gray-800/40 rounded-3xl p-6 md:p-8 border border-[#e0efff]/50 dark:border-gray-700/30 flex flex-col justify-between shadow-soft">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <RobotIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white">
                      Chat with AI Travel Assistant
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Unlock exclusive savings up to 25% on selected routes
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-655 dark:text-gray-300 leading-relaxed font-medium">
                  Have specific schedule constraints or looking for the absolute best fare? Type query to get recommendations and book directly from the AI chat.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                  <button
                    onClick={() => setShowAiChat(true)}
                    className="text-left px-4 py-3 bg-white dark:bg-gray-800 hover:border-booking-lightblue border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-all font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ChatBubbleIcon className="w-4 h-4 text-booking-lightblue" />
                      <span>"Flights from DEL to BOM"</span>
                    </span>
                    <span className="text-gray-400">➔</span>
                  </button>
                  <button
                    onClick={() => setShowAiChat(true)}
                    className="text-left px-4 py-3 bg-white dark:bg-gray-800 hover:border-booking-lightblue border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-all font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-booking-lightblue" />
                      <span>"Cheap flights to Bangalore"</span>
                    </span>
                    <span className="text-gray-400">➔</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowAiChat(true)}
                className="mt-6 w-full sm:w-auto self-start bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-105 text-white font-extrabold py-3.5 px-8 rounded-full transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <RobotIcon className="w-5 h-5 text-white" />
                <span>OPEN CHAT ASSISTANT</span>
              </button>
            </div>

            {/* Travel portal stats */}
            <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 md:p-8 rounded-3xl shadow-soft flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-extrabold text-gray-855 dark:text-white uppercase tracking-wider text-xs">
                  Why FlyFast?
                </h4>
                <ul className="space-y-3.5 text-sm text-gray-655 dark:text-gray-400">
                  <li className="flex items-start gap-2.5">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>No hidden payment gateway fees or convenience charges</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>100% Instant Refund on cancellations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Interactive 3D Seating maps with no standard selection fees</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-755 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <SecureIcon className="w-4 h-4 text-emerald-500" />
                  Secure SSL Payments
                </span>
                <span className="flex items-center gap-1.5">
                  <FlashIcon className="w-4 h-4 text-amber-500" />
                  Fast Booking
                </span>
              </div>
            </div>
          </div>

          {/* AI Chat Modal Dialog */}
          {showAiChat && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl h-[650px] shadow-2xl animate-scale-in overflow-hidden border border-gray-200 dark:border-gray-700">
                <EnhancedAiChat
                  onClose={() => setShowAiChat(false)}
                  sessionId="home-session"
                />
              </div>
            </div>
          )}

          {/* Rich Destination Exploration Modal */}
          {selectedExplorePlace && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">

                {/* Image Header Block with Carousel */}
                <div className="relative h-56 bg-gray-100 dark:bg-gray-955 overflow-hidden shrink-0">
                  {(() => {
                    const imgs = selectedExplorePlace.imgs || [selectedExplorePlace.img];
                    return (
                      <>
                        <img
                          src={imgs[activeImageIndex]}
                          alt={selectedExplorePlace.title}
                          className="w-full h-full object-cover transition-all duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                        {imgs.length > 1 && (
                          <>
                            {/* Slide Navigation Arrows */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => (prev === 0 ? imgs.length - 1 : prev - 1));
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all focus:outline-none z-10"
                            >
                              ◀
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all focus:outline-none z-10"
                            >
                              ▶
                            </button>
                            {/* Dot Indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                              {imgs.map((_: any, idx: number) => (
                                <span
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                  {/* Close floating button */}
                  <button
                    onClick={() => setSelectedExplorePlace(null)}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all focus:outline-none z-10"
                    aria-label="Close Details"
                  >
                    ✕
                  </button>

                  {/* Title labels overlay */}
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide leading-tight">
                      {selectedExplorePlace.title}
                    </h3>
                    <p className="text-xs text-gray-300 font-semibold mt-1">
                      {selectedExplorePlace.desc}
                    </p>
                  </div>
                </div>

                {/* Body Details Container */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left text-sm scrollbar-thin">

                  {/* Description segment */}
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
                      Overview
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                      {selectedExplorePlace.details}
                    </p>
                  </div>

                  {/* Bulleted attractions */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
                      Key Highlights
                    </h4>
                    <ul className="space-y-1.5 text-gray-500 dark:text-gray-400">
                      {selectedExplorePlace.highlights.split(", ").map((hl: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#ff6636] font-bold">✓</span>
                          <span className="font-semibold text-xs sm:text-sm">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Seasonal advice */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-booking-lightblue">
                      Best Time to Visit
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200 font-extrabold">
                      {selectedExplorePlace.bestTime}
                    </p>
                  </div>

                  {/* Dynamic metric (Price/Rating/Duration) footer bar */}
                  {selectedExplorePlace.price && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Starting From</span>
                      <span className="text-xl font-extrabold text-[#ff6636]">{selectedExplorePlace.price}</span>
                    </div>
                  )}

                  {selectedExplorePlace.rating && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">User Rating</span>
                      <span className="text-xs font-extrabold bg-amber-500 text-gray-950 px-2 py-0.5 font-mono">{selectedExplorePlace.rating}</span>
                    </div>
                  )}

                  {selectedExplorePlace.durationKey && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Duration</span>
                      <span className="text-xs font-extrabold text-[#ff6636] bg-[#ff6636]/10 px-2 py-0.5">{selectedExplorePlace.duration}</span>
                    </div>
                  )}
                </div>

                {/* Footer buttons row */}
                <div className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-3">
                  <button
                    onClick={() => setSelectedExplorePlace(null)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-extrabold text-xs uppercase tracking-wider transition-colors hover:bg-gray-100 dark:hover:bg-gray-850"
                  >
                    Close Details
                  </button>

                  {activeTab === "flights" && selectedExplorePlace.code && (
                    <button
                      onClick={() => {
                        setDestination(selectedExplorePlace.code);
                        setSelectedExplorePlace(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#ff6636] to-[#ff3600] text-white font-extrabold text-xs uppercase tracking-wider transition-all hover:brightness-105 shadow-md"
                    >
                      Set as Destination
                    </button>
                  )}

                  {activeTab !== "flights" && (
                    <button
                      onClick={() => {
                        setSelectedExplorePlace(null);
                        // Redirect user visually back to target category console
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-3 bg-booking-lightblue text-white font-extrabold text-xs uppercase tracking-wider transition-all hover:brightness-105 shadow-md"
                    >
                      Book Reservation
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Draggable Floating AI Chat Button */}
          <DraggableAiButton onClick={() => setShowAiChat(true)} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
