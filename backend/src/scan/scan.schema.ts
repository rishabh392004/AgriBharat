import { z } from "zod";

export const createScanSchema = z.object({
  farmId: z.number().int().positive().optional(),
  imageUrl: z.string().trim().min(1, "imageUrl is required"),
  cropName: z.string().optional(),
});

export const analyzeScanSchema = z.object({
  imageUrl: z.string().trim().min(1, "imageUrl is required"),
  cropName: z.string().optional().default("Auto"),
  latitude: z.coerce.number().optional().default(19.9975),
  longitude: z.coerce.number().optional().default(73.7898),
  farmId: z.number().int().positive().optional(),
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
export type AnalyzeScanInput = z.infer<typeof analyzeScanSchema>;