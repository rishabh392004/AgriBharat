import { z } from "zod";

export const diagnosisScanIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type DiagnosisScanIdInput = z.infer<typeof diagnosisScanIdSchema>;
