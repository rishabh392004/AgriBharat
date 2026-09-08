import { describe, expect, it, afterAll } from "vitest";
import { app, server } from "./server.js";

afterAll(() => {
  server.close();
});

describe("AgriBharat End-to-End API Integration Suite", () => {
  it("GET /health responds with 200 and service name", async () => {
    const res = await fetch("http://localhost:5000/health");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("OK");
    expect(data.service).toBe("AgriBharat Backend");
  });

  it("POST /api/v1/auth/login rejects invalid body with 400", async () => {
    const res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "123" }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Validation failed");
  });

  it("GET /api/v1/officer/metrics rejects unauthenticated calls with 401", async () => {
    const res = await fetch("http://localhost:5000/api/v1/officer/metrics");
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/scans/analyze analyzes crop image and returns diagnosis", async () => {
    const res = await fetch("http://localhost:5000/api/v1/scans/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cropName: "Tomato",
        imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=300",
        latitude: 19.9975,
        longitude: 73.7898,
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("success");
    expect(data.diagnosis).toBeDefined();
    expect(data.diagnosis.disease).toBeDefined();
    expect(data.diagnosis.confidence).toBeGreaterThan(0);
    expect(data.diagnosis.recommendation).toBeDefined();
  });

  it("POST /api/v1/chatbot/ask provides intelligent agronomy answers", async () => {
    const res = await fetch("http://localhost:5000/api/v1/chatbot/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "How to treat powdery mildew in crops?",
        language: "en",
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBeDefined();
    expect(typeof data.answer).toBe("string");
  });
});
