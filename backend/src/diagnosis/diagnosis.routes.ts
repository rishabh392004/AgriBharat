import { Router } from "express";

import {
  diagnoseScanController,
  getDiagnosisController,
} from "./diagnosis.controller.js";

const router = Router();

router.post("/:id/diagnosis", diagnoseScanController);
router.get("/:id/diagnosis", getDiagnosisController);

export default router;
