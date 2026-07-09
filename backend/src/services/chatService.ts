import { callLLM } from "./llmClient";
import * as flightService from "./flightService";

// Helper to locally parse flight search intents
function getLocalDateString(d: Date = new Date()): string {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}

function localParseQuery(message: string): any {
  const m = message.toLowerCase().trim();
  const cities: Record<string, string> = {
    delhi: "DEL", del: "DEL", "new delhi": "DEL",
    mumbai: "BOM", bom: "BOM", bombay: "BOM",
    bangalore: "BLR", bengaluru: "BLR", blr: "BLR", banglore: "BLR",
    chennai: "MAA", maa: "MAA", madras: "MAA",
    kolkata: "CCU", ccu: "CCU", calcutta: "CCU",
    hyderabad: "HYD", hyd: "HYD",
    pune: "PNQ", pnq: "PNQ",
    ahmedabad: "AMD", amd: "AMD",
    goa: "GOI", goi: "GOI",
    kochi: "COK", cochin: "COK", cok: "COK",
    jaipur: "JAI", jai: "JAI",
    mysore: "MYS", mys: "MYS"
  };

  let origin: string | null = null;
  let destination: string | null = null;

  // 1. Try to find route like "X to Y" or "X - Y" or "X -> Y"
  const routeMatch = m.match(/([a-z0-9\s]+?)\s*(?:to|-|->)\s*([a-z0-9\s]+)/);
  if (routeMatch) {
    const fromPart = routeMatch[1].trim();
    const toPart = routeMatch[2].trim();
    
    // Check if parts match any city name/code in our map
    for (const key of Object.keys(cities)) {
      if (fromPart === key || fromPart.includes(key)) {
        origin = cities[key];
      }
      if (toPart === key || toPart.includes(key)) {
        destination = cities[key];
      }
    }
  }

  // 2. Fallback: if we haven't found origin and destination yet, search the whole message
  if (!origin || !destination) {
    const found: string[] = [];
    for (const city of Object.keys(cities)) {
      if (m.includes(city)) {
        const code = cities[city];
        if (!found.includes(code)) {
          found.push(code);
        }
      }
    }
    if (found.length >= 2) {
      if (!origin) origin = found[0];
      if (!destination) destination = found[1];
    } else if (found.length === 1) {
      if (!origin) origin = found[0];
    }
  }

  // 3. Parse Date: look for YYYY-MM-DD or tomorrow or today
  let dateStr = getLocalDateString(); // default to today if not provided or parsed
  
  const dateMatch = m.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) {
    dateStr = dateMatch[0];
  } else if (m.includes("tomorrow")) {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    dateStr = getLocalDateString(tmr);
  } else if (m.includes("day after tomorrow")) {
    const dat = new Date();
    dat.setDate(dat.getDate() + 2);
    dateStr = getLocalDateString(dat);
  } else if (m.includes("next week")) {
    const nw = new Date();
    nw.setDate(nw.getDate() + 7);
    dateStr = getLocalDateString(nw);
  }

  return {
    origin: origin || null,
    destination: destination || null,
    date: dateStr
  };
}

export async function handleChatMessage({ message, sessionId }: { message: string; sessionId?: string }) {
  const system = `You are a flight booking assistant. Respond in JSON ONLY with:
{
  "reply_text": "...",
  "intent": "search_flights"|"book_flight"|"ask_for_details"|"none",
  "parameters": { }
}
If user asks to search flights, set intent to search_flights and parameters { origin, destination, date }.
If user asks to book, set intent to book_flight and parameters { flightId }.
Do not include any additional keys. Use ISO date strings.`;
  const safeMessage = String(message).slice(0, 1000);

  let resp = "";
  let useFallback = false;

  try {
    resp = await callLLM([
      { role: "system", content: system },
      { role: "user", content: safeMessage }
    ]);
  } catch (err) {
    console.warn("OpenAI API call failed or quota exceeded in chatbot. Running local chat fallback.", err);
    useFallback = true;
  }

  // If call succeeded, parse it
  if (!useFallback && resp) {
    try {
      const parsed = JSON.parse(resp);
      if (parsed.intent === "search_flights" && parsed.parameters?.origin && parsed.parameters?.destination) {
        const flights = await flightService.searchFlights(parsed.parameters.origin, parsed.parameters.destination, parsed.parameters.date);
        parsed.parameters.flights = flights;
        parsed.reply_text = parsed.reply_text || `Found ${flights.length} flights.`;
      }
      return parsed;
    } catch (e) {
      // Fall through to local parsing if JSON is corrupt
    }
  }

  // --- LOCAL CHAT FALLBACK ---
  const lowerMsg = safeMessage.toLowerCase();
  const parsedLocal = localParseQuery(safeMessage);
  
  // Check if search intent (either explicitly mentions flight search, or contains origin and destination!)
  if (
    lowerMsg.includes("flight") || 
    lowerMsg.includes("search") || 
    lowerMsg.includes("go to") || 
    lowerMsg.includes("fly") ||
    (parsedLocal.origin && parsedLocal.destination) // If both origin and destination are parsed, treat as flight search!
  ) {
    const origin = parsedLocal.origin || "DEL";
    const destination = parsedLocal.destination || "BOM";
    const date = parsedLocal.date;
    const flights = await flightService.searchFlights(origin, destination, date);
    
    return {
      reply_text: `Local AI Chat: I searched flights from ${origin} to ${destination} for ${date} and found ${flights.length} options!`,
      intent: "search_flights",
      parameters: {
        origin,
        destination,
        date,
        flights
      }
    };
  }

  // Check if booking intent
  if (lowerMsg.includes("book") || lowerMsg.includes("reserve") || lowerMsg.includes("pay")) {
    return {
      reply_text: "Local AI Chat: To book a flight, please search for flights on the homepage, click 'View Details' on your preferred option, and complete checkout.",
      intent: "ask_for_details",
      parameters: {}
    };
  }

  // Default chat responder
  return {
    reply_text: "Local AI Chat: Hello! I'm here to assist you with flight queries. Try asking: 'Find flights from Delhi to Mumbai' or search directly on the Home dashboard.",
    intent: "none",
    parameters: {}
  };
}
