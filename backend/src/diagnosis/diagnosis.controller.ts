import type { Response } from "express";

import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { AppError } from "../common/AppError.js";
import { diagnosisScanIdSchema } from "./diagnosis.schema.js";
import { diagnoseScan } from "./diagnosis.service.js";

export async function diagnoseScanController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = diagnosisScanIdSchema.safeParse(req.params);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid scan ID",
    });
    return;
  }

  const diagnosis = await diagnoseScan(result.data.id);

  res.status(200).json({
    message: "Diagnosis completed successfully",
    diagnosis,
  });
}
