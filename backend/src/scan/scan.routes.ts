import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";

import {
  createScanController,
  getScanController,
  getScansController,
  updateScanStatusController,
} from "./scan.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createScanController);
router.get("/", getScansController);
router.get("/:id", getScanController);
router.patch("/:id/status", updateScanStatusController);

export default router;