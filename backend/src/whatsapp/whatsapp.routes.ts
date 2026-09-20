import { Router } from "express";
import express from "express";
import {
  whatsappStatusController,
  whatsappWebhookController,
} from "./whatsapp.controller.js";

const router = Router();

/**
 * GET /api/v1/whatsapp/status
 * Returns whether Twilio credentials are configured and the webhook is active.
 */
router.get("/status", whatsappStatusController);

/**
 * POST /api/v1/whatsapp/webhook
 * Twilio WhatsApp Business / Sandbox webhook.
 *
 * Configure in Twilio Console → WhatsApp Sandbox → "When a message comes in":
 *   Method: HTTP POST
 *   URL: https://<your-ngrok-or-domain>/api/v1/whatsapp/webhook
 *
 * Body is application/x-www-form-urlencoded (Twilio standard).
 */
router.post(
  "/webhook",
  express.urlencoded({ extended: false }), // parse Twilio's form-encoded body
  whatsappWebhookController
);

export default router;
