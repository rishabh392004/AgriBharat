import { z } from "zod";

export const createScanSchema = z.object({
  farmId: z.number().int().positive(),
  imageUrl: z.string().trim().url(),
});

export const scanIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateScanStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
  ]),
});

export type UpdateScanStatusInput = z.infer<
  typeof updateScanStatusSchema
>;

export type CreateScanInput = z.infer<typeof createScanSchema>;