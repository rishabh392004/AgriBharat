import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";

import diagnosisRoutes from "../diagnosis/diagnosis.routes.js";
import {
  createScanController,
  getScanController,
  getScansController,
} from "./scan.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createScanController);
router.get("/", getScansController);
router.get("/:id", getScanController);
router.use(diagnosisRoutes);

export default router;