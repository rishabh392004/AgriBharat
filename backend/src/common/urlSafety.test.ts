import { describe, expect, it } from "vitest";
import { assertPublicHttpUrl, isPrivateOrReservedIp } from "./urlSafety.js";

describe("urlSafety", () => {
  describe("isPrivateOrReservedIp", () => {
    it("identifies private IPv4 ranges", () => {
      expect(isPrivateOrReservedIp("10.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("10.255.255.255")).toBe(true);
      expect(isPrivateOrReservedIp("172.16.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("172.31.255.255")).toBe(true);
      expect(isPrivateOrReservedIp("192.168.1.1")).toBe(true);
      expect(isPrivateOrReservedIp("192.168.0.100")).toBe(true);
    });

    it("identifies loopback, link-local, and cloud metadata IPv4 ranges", () => {
      expect(isPrivateOrReservedIp("127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("127.0.0.2")).toBe(true);
      expect(isPrivateOrReservedIp("169.254.169.254")).toBe(true);
      expect(isPrivateOrReservedIp("169.254.1.1")).toBe(true);
      expect(isPrivateOrReservedIp("0.0.0.0")).toBe(true);
    });

    it("identifies private and loopback IPv6 ranges", () => {
      expect(isPrivateOrReservedIp("::1")).toBe(true);
      expect(isPrivateOrReservedIp("::")).toBe(true);
      expect(isPrivateOrReservedIp("fc00::1")).toBe(true);
      expect(isPrivateOrReservedIp("fd00::1")).toBe(true);
      expect(isPrivateOrReservedIp("fe80::1")).toBe(true);
    });

    it("identifies IPv4-mapped IPv6 private addresses", () => {
      expect(isPrivateOrReservedIp("::ffff:127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("::ffff:169.254.169.254")).toBe(true);
      expect(isPrivateOrReservedIp("::ffff:10.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("::ffff:192.168.1.1")).toBe(true);
    });

    it("permits public IP addresses", () => {
      expect(isPrivateOrReservedIp("8.8.8.8")).toBe(false);
      expect(isPrivateOrReservedIp("1.1.1.1")).toBe(false);
      expect(isPrivateOrReservedIp("93.184.216.34")).toBe(false);
    });
  });

  describe("assertPublicHttpUrl", () => {
    it("rejects non-HTTP/HTTPS protocols", async () => {
      await expect(assertPublicHttpUrl("ftp://example.com/image.jpg")).rejects.toThrow(
        "Only http/https image URLs are allowed"
      );
      await expect(assertPublicHttpUrl("file:///etc/passwd")).rejects.toThrow(
        "Only http/https image URLs are allowed"
      );
      await expect(assertPublicHttpUrl("javascript:alert(1)")).rejects.toThrow(
        "Only http/https image URLs are allowed"
      );
      await expect(assertPublicHttpUrl("not-a-url")).rejects.toThrow(
        "Invalid URL format"
      );
    });

    it("rejects localhost and loopback hosts", async () => {
      await expect(assertPublicHttpUrl("http://localhost:5000/api")).rejects.toThrow(
        "This image URL is not allowed"
      );
      await expect(assertPublicHttpUrl("http://127.0.0.1:8000/image.png")).rejects.toThrow(
        "This image URL is not allowed"
      );
      await expect(assertPublicHttpUrl("http://0.0.0.0:8000")).rejects.toThrow(
        "This image URL is not allowed"
      );
      await expect(assertPublicHttpUrl("http://[::1]:8000")).rejects.toThrow(
        "This image URL is not allowed"
      );
    });

    it("rejects AWS/GCP cloud metadata IP address (169.254.169.254)", async () => {
      await expect(
        assertPublicHttpUrl("http://169.254.169.254/latest/meta-data/")
      ).rejects.toThrow("This image URL is not allowed");
    });

    it("rejects private subnet IPs directly", async () => {
      await expect(assertPublicHttpUrl("http://10.0.0.5/plant.jpg")).rejects.toThrow(
        "This image URL is not allowed"
      );
      await expect(assertPublicHttpUrl("http://192.168.1.50/leaf.png")).rejects.toThrow(
        "This image URL is not allowed"
      );
      await expect(assertPublicHttpUrl("http://172.16.0.1/test.jpg")).rejects.toThrow(
        "This image URL is not allowed"
      );
    });

    it("accepts a valid public IP URL", async () => {
      // 93.184.216.34 is example.com's public IP
      await expect(
        assertPublicHttpUrl("http://93.184.216.34/plant.jpg")
      ).resolves.toBeUndefined();
    });
  });
});
