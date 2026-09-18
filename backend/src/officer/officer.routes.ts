import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorize.middleware.js";
import { OFFICER_ROLE, ADMIN_ROLE } from "../auth/auth.types.js";
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
 * @route   POST /api/v1/officer/profile
 * @desc    Create officer profile (user must have role=OFFICER or ADMIN)
 * @access  Private (OFFICER or ADMIN)
 */
router.post("/profile", authorize(OFFICER_ROLE, ADMIN_ROLE), createOfficerProfileController);

/**
 * @route   GET /api/v1/officer/profile/me
 * @desc    Get the authenticated officer's own profile
 * @access  Private (OFFICER or ADMIN)
 */
router.get("/profile/me", authorize(OFFICER_ROLE, ADMIN_ROLE), getMyProfileController);

/**
 * @route   GET /api/v1/officer/profile/:userId
 * @desc    Get any officer profile by userId (sanitized for farmers)
 * @access  Private
 */
router.get("/profile/:userId", getOfficerProfileController);

/**
 * @route   PATCH /api/v1/officer/profile/me
 * @desc    Update the authenticated officer's own profile
 * @access  Private (OFFICER or ADMIN)
 */
router.patch("/profile/me", authorize(OFFICER_ROLE, ADMIN_ROLE), updateOfficerProfileController);

export default router;
