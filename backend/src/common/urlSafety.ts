import { isIP } from "node:net";
import dns from "node:dns/promises";
import { AppError } from "./AppError.js";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
  "metadata.google.internal",
]);

/**
 * Checks if an IPv4 or IPv6 address belongs to a private, loopback, link-local,
 * or cloud metadata network.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // Normalize IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1)
  const ipv4Mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const targetIp = ipv4Mapped ? ipv4Mapped[1]! : ip;

  // IPv4 Private & Reserved Ranges:
  // 0.0.0.0/8 (current network)
  // 10.0.0.0/8 (private)
  // 127.0.0.0/8 (loopback)
  // 169.254.0.0/16 (link-local & cloud metadata)
  // 172.16.0.0/12 (private: 172.16.0.0 - 172.31.255.255)
  // 192.168.0.0/16 (private)
  // 100.64.0.0/10 (carrier-grade NAT)
  // 192.0.0.0/24, 192.0.2.0/24 (documentation)
  // 198.18.0.0/15 (benchmark)
  // 198.51.100.0/24, 203.0.113.0/24 (documentation)
  // 224.0.0.0/4 (multicast)
  // 240.0.0.0/4 (reserved)
  if (
    /^0\./.test(targetIp) ||
    /^10\./.test(targetIp) ||
    /^127\./.test(targetIp) ||
    /^169\.254\./.test(targetIp) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(targetIp) ||
    /^192\.168\./.test(targetIp) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(targetIp) ||
    /^192\.0\.[02]\./.test(targetIp) ||
    /^198\.(1[89])\./.test(targetIp) ||
    /^198\.51\.100\./.test(targetIp) ||
    /^203\.0\.113\./.test(targetIp) ||
    /^(22[4-9]|23\d|24\d|25[0-5])\./.test(targetIp)
  ) {
    return true;
  }

  // IPv6 Private & Reserved Ranges:
  // ::1 (loopback)
  // :: (unspecified)
  // fc00::/7 (unique local address)
  // fe80::/10 (link-local)
  // ff00::/8 (multicast)
  const lower = targetIp.toLowerCase();
  if (
    lower === "::1" ||
    lower === "::" ||
    /^fc[0-9a-f]{2}:/i.test(lower) ||
    /^fd[0-9a-f]{2}:/i.test(lower) ||
    /^fe[89ab][0-9a-f]:/i.test(lower) ||
    /^ff[0-9a-f]{2}:/i.test(lower)
  ) {
    return true;
  }

  return false;
}

/**
 * Validates that a user-supplied URL is a safe, public HTTP/HTTPS URL.
 * Rejects private IPs, loopback, cloud metadata endpoints, and non-HTTP protocols.
 */
export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new AppError("Invalid URL format", 400);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AppError("Only http/https image URLs are allowed", 400);
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTS.has(hostname)) {
    throw new AppError("This image URL is not allowed", 400);
  }

  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new AppError("This image URL is not allowed", 400);
    }
    return;
  }

  // Resolve DNS to verify host doesn't point to private / metadata IP
  try {
    const addresses = await dns.resolve(hostname);
    for (const address of addresses) {
      if (isPrivateOrReservedIp(address)) {
        throw new AppError("This image URL is not allowed", 400);
      }
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    // If dns.resolve fails or throws ENOTFOUND, try lookup as fallback
    try {
      const lookupResult = await dns.lookup(hostname);
      if (isPrivateOrReservedIp(lookupResult.address)) {
        throw new AppError("This image URL is not allowed", 400);
      }
    } catch (lookupErr) {
      if (lookupErr instanceof AppError) throw lookupErr;
      throw new AppError("Could not resolve image host", 400);
    }
  }
}
