import { callLLM } from "./llmClient";
import * as flightService from "./flightService";

export async function handleChatMessage({ message, sessionId }: { message: string; sessionId?: string }) {
  const system = `You are a flight booking assistant. Respond in JSON ONLY with:
{
  "reply_text": "...",
  "intent": "search_flights"|"book_flight"|"ask_for_details"|"none",
  "parameters": { ... }
}
If user asks to search flights, set intent to search_flights and parameters { origin, destination, date }.
If user asks to book, set intent to book_flight and parameters { flightId }.
Do not include any additional keys. Use ISO date strings.`;
  const resp = await callLLM([
    { role: "system", content: system },
    { role: "user", content: message }
  ]);
  try {
    const parsed = JSON.parse(resp);
    if (parsed.intent === "search_flights" && parsed.parameters?.origin && parsed.parameters?.destination) {
      const flights = await flightService.searchFlights(parsed.parameters.origin, parsed.parameters.destination, parsed.parameters.date);
      parsed.parameters.flights = flights;
      parsed.reply_text = parsed.reply_text || `Found ${flights.length} flights.`;
    }
    return parsed;
  } catch (e) {
    return { reply_text: resp, intent: "none", parameters: {} };
  }
}
