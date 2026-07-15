import request from "supertest";
import { app } from "../server";
import { prisma } from "../db";
function getLocalDateString(d: Date = new Date()): string {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}
describe("Chatbot API Endpoints", () => {
  beforeEach(async () => {
    // Clear flight and booking tables to prevent overlapping states
    await prisma.verificationCode.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.flight.deleteMany();
  });

  it("should fail if message is missing or empty", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .send({ message: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "message required");
  });

  it("should fail if message is too long", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .send({ message: "a".repeat(1001) });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "message too long");
  });

  it("should parse search flights intent and return matching flights using local fallback", async () => {
    // Populate some flights for tomorrow first
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    await prisma.flight.createMany({
      data: [
        {
          origin: "DEL",
          destination: "BOM",
          airline: "IndiGo",
          flightNumber: "6E-101",
          departure: new Date(`${tomorrowStr}T10:00:00Z`),
          arrival: new Date(`${tomorrowStr}T12:00:00Z`),
          basePriceCents: 500000
        }
      ]
    });

    const res = await request(app)
      .post("/api/chat/message")
      .send({ message: "Find flights from Delhi to Mumbai tomorrow" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("intent", "search_flights");
    expect(res.body.parameters).toHaveProperty("origin", "DEL");
    expect(res.body.parameters).toHaveProperty("destination", "BOM");
    expect(res.body.parameters).toHaveProperty("date", tomorrowStr);
    expect(Array.isArray(res.body.parameters.flights)).toBe(true);
    expect(res.body.parameters.flights.length).toBe(1);
    expect(res.body.reply_text).toContain("Local AI Chat: I searched flights from DEL to BOM");
  });

  it("should handle book flight intent request", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .send({ message: "I want to book a ticket please" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("intent", "ask_for_details");
    expect(res.body.reply_text).toContain("To book a flight, please search for flights on the homepage");
  });

  it("should handle general greetings or random queries", async () => {
    const res = await request(app)
      .post("/api/chat/message")
      .send({ message: "Hello! Who are you?" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("intent", "none");
    expect(res.body.reply_text).toContain("Hello! I'm here to assist you with flight queries");
  });
});
