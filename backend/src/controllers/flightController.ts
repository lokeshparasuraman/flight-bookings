import { Router } from "express";
import * as flightService from "../services/flightService";
import { callLLM } from "../services/llmClient";
import { prisma } from "../db";

const router = Router();

// Local regex parser fallback for API quota exhaustion / rate limiting
function parseSearchFallback(query: string): any {
  const q = query.toLowerCase();
  
  // Mapping of keywords to codes for all 11 seeded airports
  const cities: Record<string, string> = {
    delhi: "DEL", "new delhi": "DEL", del: "DEL",
    mumbai: "BOM", bombay: "BOM", bom: "BOM",
    bangalore: "BLR", bengaluru: "BLR", blr: "BLR",
    chennai: "MAA", madras: "MAA", maa: "MAA",
    kolkata: "CCU", calcutta: "CCU", ccu: "CCU",
    hyderabad: "HYD", secunderabad: "HYD", hyd: "HYD",
    pune: "PNQ", poona: "PNQ", pnq: "PNQ",
    ahmedabad: "AMD", amdavad: "AMD", amd: "AMD",
    goa: "GOI", dabolim: "GOI", goi: "GOI",
    cochin: "COK", kochi: "COK", cok: "COK",
    jaipur: "JAI", "pink city": "JAI", pinkcity: "JAI", jai: "JAI",
    mysore: "MYS", mysuru: "MYS", mys: "MYS"
  };

  let origin: string | null = null;
  let destination: string | null = null;

  // Build a dynamic regex pattern from city keys sorted by length descending to match longer keywords first
  const sortedCityKeys = Object.keys(cities).sort((a, b) => b.length - a.length);
  const cityPatternStr = `(${sortedCityKeys.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`;
  
  const toMatch = q.match(new RegExp(`(?:from\\s+)?${cityPatternStr}\\s+(?:to|->|-)\\s+${cityPatternStr}`, 'i'));
  const fromMatch = q.match(new RegExp(`(?:to\\s+)${cityPatternStr}\\s+(?:from)\\s+${cityPatternStr}`, 'i'));

  if (toMatch) {
    origin = cities[toMatch[1]];
    destination = cities[toMatch[2]];
  } else if (fromMatch) {
    destination = cities[fromMatch[1]];
    origin = cities[fromMatch[2]];
  } else {
    // Look for any mentions of city keys in the query
    const found: string[] = [];
    const globalCityRegex = new RegExp(cityPatternStr, 'gi');
    let match;
    while ((match = globalCityRegex.exec(q)) !== null) {
      const code = cities[match[0].toLowerCase()];
      if (code && !found.includes(code)) {
        found.push(code);
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
  let dateStr: string | null = null;
  const today = new Date();
  const dateTodayStr = today.toISOString().split('T')[0];
  if (q.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    dateStr = tomorrow.toISOString().split('T')[0];
  } else if (q.includes("next monday")) {
    const nextMonday = new Date();
    const day = today.getDay();
    const distance = (8 - day) % 7 || 7;
    nextMonday.setDate(today.getDate() + distance);
    dateStr = nextMonday.toISOString().split('T')[0];
  } else if (q.includes("next week")) {
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    dateStr = nextWeek.toISOString().split('T')[0];
  } else {
    // Check for YYYY-MM-DD
    const dateMatch = q.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      dateStr = dateMatch[0];
    }
  }

  // Parse Class
  let seatClass = "ECONOMY";
  if (q.includes("business")) {
    seatClass = "BUSINESS";
  }

  // Fallback to defaults to keep it functional
  if (!origin) origin = "DEL";
  if (!destination) destination = "BOM";
  if (!dateStr) dateStr = dateTodayStr; // default to actual system date

  return {
    origin,
    destination,
    date: dateStr,
    airline: q.includes("skyjet") ? "SkyJet" : q.includes("demoair") ? "DemoAir" : "FlyFast",
    seatClass,
    summary: `Parsed local criteria: ${origin} to ${destination} on ${dateStr} (${seatClass} class)`
  };
}

router.get("/search", async (req, res, next) => {
  try {
    const { origin, destination, date } = req.query;
    if (!origin || !destination) return res.status(400).json({ error: "origin & destination required" });
    const flights = await flightService.searchFlights(String(origin), String(destination), date ? String(date) : undefined);
    res.json(flights);
  } catch (e) {
    next(e);
  }
});

router.post("/ai-search", async (req, res, next) => {
  try {
    const { query } = req.body;
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const systemPrompt = `You are a flight search parsing assistant. Parse the user's natural language query into a structured JSON search query for flights.
You must respond in JSON ONLY. Do not include any markdown formatting, backticks, or explanation.

The output JSON structure must be exactly:
{
  "origin": "DEL" | "BOM" | "BLR" | "MYS" | null,
  "destination": "DEL" | "BOM" | "BLR" | "MYS" | null,
  "date": "YYYY-MM-DD" | null,
  "airline": "DemoAir" | "FlyFast" | "SkyJet" | null,
  "seatClass": "BUSINESS" | "ECONOMY" | null,
  "summary": "Brief description of what was understood..."
}

Note:
- If a city is mentioned, map it to its airport code if you know it (e.g. Delhi -> DEL, Mumbai -> BOM, Bangalore/Bengaluru -> BLR, Mysore -> MYS). If you don't know it, keep it as code or null.
- Dates should be converted to ISO format "YYYY-MM-DD" relative to the current local time of ${todayStr}. E.g. if today is ${todayStr}, "tomorrow" would be tomorrow's date.
- If no date is mentioned, keep date as null.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `QUERY: "${query}"` }
    ];

    try {
      const llmResult = await callLLM(messages);
      const parsed = JSON.parse(llmResult);
      res.json(parsed);
    } catch (llmErr) {
      console.warn("OpenAI API call failed or quota exceeded. Using local regex fallback parser.", llmErr);
      const fallbackParsed = parseSearchFallback(query);
      res.json(fallbackParsed);
    }
  } catch (e) {
    next(e);
  }
});

router.get("/routes", async (req, res, next) => {
  try {
    const routes = await flightService.getAvailableRoutes();
    res.json(routes);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    res.json(flight);
  } catch (e) {
    next(e);
  }
});

export default router;
