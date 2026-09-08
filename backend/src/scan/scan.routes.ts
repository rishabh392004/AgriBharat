import { Router } from "express";

import { authMiddleware, optionalAuthMiddleware } from "../auth/auth.middleware.js";

import diagnosisRoutes from "../diagnosis/diagnosis.routes.js";
import {
  createScanController,
  analyzeScanController,
  getScanController,
  getScansController,
} from "./scan.controller.js";

const router = Router();

/**
 * @route   POST /api/v1/scans/analyze
 * @desc    Diagnose a crop image with Grad-CAM and ETL analysis (works with or without login)
 * @access  Public / Optional Auth
 */
router.post("/analyze", optionalAuthMiddleware, analyzeScanController);

// All routes below require valid JWT authentication
router.use(authMiddleware);

router.post("/", createScanController);
router.get("/", getScansController);
router.get("/:id", getScanController);
router.use(diagnosisRoutes);

export default router;