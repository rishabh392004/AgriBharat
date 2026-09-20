/**
 * AgriBharat — Twilio WhatsApp Webhook Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Receives incoming WhatsApp messages via Twilio's Messaging API webhook.
 * When a farmer sends a leaf photo:
 *   1. Downloads the image from Twilio's CDN
 *   2. Forwards it to the local Python ML ResNet-34 service (/predict)
 *   3. Formats a diagnosis reply with ICAR spray recipe
 *   4. Sends the reply back via Twilio's TwiML response
 *
 * To activate in production:
 *   • Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in .env
 *   • Point your Twilio WhatsApp Sandbox/Business webhook to:
 *       POST https://<your-domain>/api/v1/whatsapp/webhook
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Request, Response } from "express";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ?? "http://localhost:8000";

const TWILIO_ACCOUNT_SID   = process.env.TWILIO_ACCOUNT_SID   ?? "";
const TWILIO_AUTH_TOKEN    = process.env.TWILIO_AUTH_TOKEN     ?? "";
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM  ?? "whatsapp:+14155238886"; // Twilio sandbox default

const IS_TWILIO_CONFIGURED =
  TWILIO_ACCOUNT_SID.startsWith("AC") && TWILIO_AUTH_TOKEN.length > 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Download image from Twilio CDN (requires Basic Auth with SID:Token) */
async function downloadTwilioImage(mediaUrl: string): Promise<Buffer | null> {
  try {
    const credentials = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const res = await fetch(mediaUrl, {
      headers: { Authorization: `Basic ${credentials}` },
    });

    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

/** Forward image buffer to the Python ML /predict endpoint */
async function runMlDiagnosis(imageBuffer: Buffer): Promise<{
  predicted_disease: string;
  confidence: number;
  severity_analysis: { infection_stage: string; action_plan: string; recommended_urgency: string };
  recommended_solution?: { chemical_spray?: { name: string; dose_per_liter: string }; precautions?: string[] };
} | null> {
  try {
    const { FormData, Blob } = await import("formdata-node");
    const form = new FormData();
    form.set(
      "image",
      new Blob([imageBuffer], { type: "image/jpeg" }),
      "leaf.jpg"
    );

    const res = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      body: form as unknown as BodyInit,
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Build a bilingual (English + Hindi) WhatsApp reply message */
function buildReplyText(
  disease: string,
  confidence: number,
  stage: string,
  actionPlan: string,
  urgency: string,
  chemicalName?: string,
  dose?: string
): string {
  const conf = Math.round(confidence * 100);
  const urgencyEmoji =
    urgency === "immediate" ? "🚨" : urgency === "high" ? "⚠️" : "✅";

  let reply =
    `🌾 *Krishi Darpan AI Diagnosis*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `🔬 *Disease / रोग:* ${disease}\n` +
    `📊 *Confidence:* ${conf}%\n` +
    `🌡️ *Severity / गंभीरता:* ${stage}\n` +
    `${urgencyEmoji} *Urgency:* ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}\n\n` +
    `📋 *Recommended Action / उपचार:*\n${actionPlan}\n`;

  if (chemicalName && dose) {
    reply += `\n💊 *Spray Recipe / छिड़काव:*\n${chemicalName} @ ${dose}`;
  }

  reply +=
    `\n\n━━━━━━━━━━━━━━━━━━\n` +
    `📞 Kisan Helpline: *1800-180-1551* (Toll-Free)\n` +
    `🤖 _Krishi Darpan AI • ICAR Validated_`;

  return reply;
}

/** TwiML response — sends a WhatsApp message back via Twilio */
function twimlReply(message: string): string {
  // Escape XML special characters
  const safe = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${safe}</Message>
</Response>`;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/whatsapp/status
 * Health check — shows whether Twilio credentials are configured.
 */
export async function whatsappStatusController(
  _req: Request,
  res: Response
): Promise<void> {
  res.json({
    service: "Krishi Darpan WhatsApp Webhook",
    twilioConfigured: IS_TWILIO_CONFIGURED,
    mlServiceUrl: ML_SERVICE_URL,
    webhookEndpoint: "POST /api/v1/whatsapp/webhook",
    integrationStatus: IS_TWILIO_CONFIGURED
      ? "ACTIVE — Twilio credentials loaded"
      : "READY — Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM to activate",
    twilioSandboxNumber: "+14155238886",
    setupGuide: "https://www.twilio.com/docs/whatsapp/sandbox",
  });
}

/**
 * POST /api/v1/whatsapp/webhook
 * Twilio sends all incoming WhatsApp messages here.
 * Responds with TwiML.
 */
export async function whatsappWebhookController(
  req: Request,
  res: Response
): Promise<void> {
  // Twilio sends form-encoded body
  const body = req.body as Record<string, string>;

  const from         = body.From ?? "";        // e.g. "whatsapp:+919876543210"
  const msgBody      = (body.Body ?? "").trim().toUpperCase();
  const numMedia     = parseInt(body.NumMedia ?? "0", 10);
  const mediaUrl     = body.MediaUrl0 ?? "";    // First attached image URL
  const mediaType    = body.MediaContentType0 ?? "";

  res.setHeader("Content-Type", "text/xml");

  // ── Text-only commands ────────────────────────────────────────────────────
  if (numMedia === 0) {
    const helpText =
      `🌾 *Krishi Darpan AI Helpline*\n\n` +
      `📸 Send a *leaf/crop photo* for instant disease diagnosis.\n\n` +
      `📟 *Commands:*\n` +
      `• WEATHER — Get disease risk forecast\n` +
      `• SCHEME  — PM-KISAN & subsidy schemes\n` +
      `• HELP    — Show this menu\n\n` +
      `📞 Toll-Free: *1800-180-1551*`;

    res.send(twimlReply(helpText));
    return;
  }

  // ── Image received — run ML diagnosis ────────────────────────────────────
  const isImage = mediaType.startsWith("image/");

  if (!isImage) {
    res.send(
      twimlReply(
        "📸 Please send a *clear leaf photo* (JPG/PNG) for disease diagnosis.\n" +
        "Voice messages and documents are not supported yet."
      )
    );
    return;
  }

  // Download from Twilio (needs auth) or fetch directly if public
  let imageBuffer: Buffer | null = null;

  if (IS_TWILIO_CONFIGURED) {
    imageBuffer = await downloadTwilioImage(mediaUrl);
  } else {
    // Fallback: attempt direct fetch (works in sandbox without auth on some Twilio plans)
    try {
      const r = await fetch(mediaUrl);
      if (r.ok) imageBuffer = Buffer.from(await r.arrayBuffer());
    } catch {
      // ignore
    }
  }

  if (!imageBuffer) {
    res.send(
      twimlReply(
        "⚠️ Could not download your image. Please try again with a clearer photo.\n" +
        "📞 Need help? Call *1800-180-1551*"
      )
    );
    return;
  }

  // Run ML model
  const prediction = await runMlDiagnosis(imageBuffer);

  if (!prediction) {
    res.send(
      twimlReply(
        "🔄 AI service is starting up. Please resend your photo in 30 seconds.\n" +
        "📞 Urgent? Call *1800-180-1551* (Free)"
      )
    );
    return;
  }

  const replyText = buildReplyText(
    prediction.predicted_disease,
    prediction.confidence,
    prediction.severity_analysis.infection_stage,
    prediction.severity_analysis.action_plan,
    prediction.severity_analysis.recommended_urgency,
    prediction.recommended_solution?.chemical_spray?.name,
    prediction.recommended_solution?.chemical_spray?.dose_per_liter
  );

  res.send(twimlReply(replyText));
}
