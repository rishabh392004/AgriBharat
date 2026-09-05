import { Router } from "express";

import { diagnoseScanController } from "./diagnosis.controller.js";

const router = Router();

router.post("/:id/diagnosis", diagnoseScanController);

export default router;
