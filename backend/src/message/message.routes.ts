import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  sendMessageController,
  getConversationController,
  getConversationListController,
  markAsReadController,
  getOfficersController,
} from "./message.controller.js";

const router = Router();

router.use(authMiddleware);

// List all conversation threads
router.get("/conversations", getConversationListController);

// List all officers (for farmers to find someone to message)
router.get("/officers", getOfficersController);

// Get conversation with a specific user
router.get("/:userId", getConversationController);

// Send a message to a specific user
router.post("/:userId", sendMessageController);

// Mark messages from a specific user as read
router.patch("/:userId/read", markAsReadController);

export default router;
