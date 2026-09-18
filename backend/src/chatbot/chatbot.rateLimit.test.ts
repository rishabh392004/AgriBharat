import { describe, expect, it, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { chatbotRateLimit } from "./chatbot.routes.js";

describe("chatbotRateLimit", () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.get("/test-ask", chatbotRateLimit, (_req, res) => {
      res.status(200).json({ status: "ok" });
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        url = `http://127.0.0.1:${port}/test-ask`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("permits 10 requests and responds with 429 on the 11th request", async () => {
    for (let i = 1; i <= 10; i++) {
      const res = await fetch(url, {
        headers: { "X-Forwarded-For": "198.51.100.42" },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ status: "ok" });
    }

    // 11th request from the same IP must be rate limited
    const blockedRes = await fetch(url, {
      headers: { "X-Forwarded-For": "198.51.100.42" },
    });
    expect(blockedRes.status).toBe(429);
    const blockedData = await blockedRes.json();
    expect(blockedData).toEqual({
      message: "Too many questions. Please wait a moment and try again.",
    });

    // Request from a different IP should succeed
    const otherIpRes = await fetch(url, {
      headers: { "X-Forwarded-For": "198.51.100.99" },
    });
    expect(otherIpRes.status).toBe(200);
  });
});
