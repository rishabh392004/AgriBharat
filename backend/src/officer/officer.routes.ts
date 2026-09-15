import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  createOfficerProfileController,
  getMyProfileController,
  getOfficerProfileController,
  updateOfficerProfileController,
} from "./officer.controller.js";

const router = Router();

// All officer routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/officer/profile
 * @desc    Create officer profile (user must have role=OFFICER)
 * @access  Private
 */
router.post("/profile", createOfficerProfileController);

/**
 * @route   GET /api/officer/profile/me
 * @desc    Get the authenticated officer's own profile
 * @access  Private
 */
router.get("/profile/me", getMyProfileController);

/**
 * @route   GET /api/officer/profile/:userId
 * @desc    Get any officer profile by userId
 * @access  Private
 */
router.get("/profile/:userId", getOfficerProfileController);

/**
 * @route   PATCH /api/officer/profile/me
 * @desc    Update the authenticated officer's own profile
 * @access  Private
 */
router.patch("/profile/me", updateOfficerProfileController);

export default router;
