import request from "supertest";
import { app } from "../server";
import { prisma } from "../db";
function getLocalDateString(d: Date = new Date()): string {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}
describe("Flight API and Seeding Endpoints", () => {
  beforeEach(async () => {
    // Clear flight and booking tables to prevent overlapping test states
    await prisma.verificationCode.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.flight.deleteMany();
  });

  describe("GET /api/flights/search", () => {
    it("should fail if origin or destination is missing", async () => {
      const res = await request(app)
        .get("/api/flights/search")
        .query({ origin: "DEL" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "origin & destination required");
    });

    it("should dynamically seed and return flights for a given date", async () => {
      const todayStr = getLocalDateString();
      const res = await request(app)
        .get("/api/flights/search")
        .query({
          origin: "DEL",
          destination: "BOM",
          date: todayStr
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("origin", "DEL");
      expect(res.body[0]).toHaveProperty("destination", "BOM");

      // Verify that flights were written to the database
      const dbFlightsCount = await prisma.flight.count({
        where: { origin: "DEL", destination: "BOM" }
      });
      expect(dbFlightsCount).toBeGreaterThan(0);
    });
  });

  describe("POST /api/flights/ai-search (Fallback Parsing)", () => {
    it("should fallback to regex parsing and identify origin/destination cities correctly", async () => {
      // Send query that should trigger fallback parsing because OpenAI is not configured
      const res = await request(app)
        .post("/api/flights/ai-search")
        .send({ query: "find flights from Delhi to Mumbai tomorrow" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("origin", "DEL");
      expect(res.body).toHaveProperty("destination", "BOM");
      expect(res.body).toHaveProperty("date");
      expect(res.body).toHaveProperty("seatClass", "ECONOMY");
      expect(res.body.summary).toContain("Parsed local criteria");

      // Verify dates are parsed correctly
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = getLocalDateString(tomorrow);
      expect(res.body.date).toBe(tomorrowStr);
    });

    it("should handle business class keywords in fallback parsing", async () => {
      const res = await request(app)
        .post("/api/flights/ai-search")
        .send({ query: "business class tickets Bangalore to Chennai next week" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("origin", "BLR");
      expect(res.body).toHaveProperty("destination", "MAA");
      expect(res.body).toHaveProperty("seatClass", "BUSINESS");
    });
  });

  describe("GET /api/flights/routes", () => {
    it("should return the list of routes with flight counts", async () => {
      const todayStr = getLocalDateString();
      // First populate some flights by running search
      await request(app)
        .get("/api/flights/search")
        .query({ origin: "DEL", destination: "BOM", date: todayStr });

      const res = await request(app)
        .get("/api/flights/routes")
        .query({ date: todayStr });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("origin");
      expect(res.body[0]).toHaveProperty("destination");
      expect(res.body[0]).toHaveProperty("_count");
    });
  });
});
