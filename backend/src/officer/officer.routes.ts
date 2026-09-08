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
 * @route   GET /api/v1/officer/profile/me (and /me alias)
 * @desc    Get the authenticated officer's own profile
 * @access  Private
 */
router.get("/profile/me", getMyProfileController);
router.get("/me", getMyProfileController);

/**
 * @route   GET /api/v1/officer/metrics
 * @desc    Get summary metrics for officer dashboard
 * @access  Private
 */
router.get("/metrics", async (_req, res) => {
  res.status(200).json({
    activeFarms: 1420,
    scansThisWeek: 384,
    criticalOutbreaks: 7,
    accuracyRate: 98.4,
    district: "Nashik",
  });
});

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
