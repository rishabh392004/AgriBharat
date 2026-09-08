import { z } from "zod";

export const createScanSchema = z.object({
  farmId: z.number().int().positive(),
  imageUrl: z.string().trim().url(),
  // Optional ML hints — passed to FastAPI for logit masking and weather context
  cropName: z.string().trim().max(64).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
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