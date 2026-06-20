import { callLLM } from "./llmClient";
import * as flightService from "./flightService";

// Helper to locally parse flight search intents
function localParseQuery(message: string): any {
  const m = message.toLowerCase();
  const cities: Record<string, string> = {
    delhi: "DEL", del: "DEL",
    mumbai: "BOM", bom: "BOM",
    bangalore: "BLR", bengaluru: "BLR", blr: "BLR",
    mysore: "MYS", mys: "MYS"
  };

  let origin: string | null = null;
  let destination: string | null = null;

  // Match: from Origin to Destination
  const routeMatch = m.match(/(delhi|mumbai|bangalore|bengaluru|mysore|del|bom|blr|mys)\s+(?:to\s+)(delhi|mumbai|bangalore|bengaluru|mysore|del|bom|blr|mys)/);
  if (routeMatch) {
    origin = cities[routeMatch[1]];
    destination = cities[routeMatch[2]];
  } else {
    // Collect any codes/cities mentioned
    const found: string[] = [];
    for (const city of Object.keys(cities)) {
      if (m.includes(city)) {
        found.push(cities[city]);
      }
    }
    if (found.length >= 2) {
      origin = found[0];
      destination = found[1];
    } else if (found.length === 1) {
      origin = found[0];
    }
  }

  // Parse Date
  let dateStr = "2025-12-20"; // default flight seed date
  const dateMatch = m.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) dateStr = dateMatch[0];

  return {
    origin: origin || "DEL",
    destination: destination || "BOM",
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
  
  // Check if search intent
  if (lowerMsg.includes("flight") || lowerMsg.includes("search") || lowerMsg.includes("go to") || lowerMsg.includes("fly")) {
    const { origin, destination, date } = localParseQuery(safeMessage);
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
