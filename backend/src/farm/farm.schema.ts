import { z } from "zod";

export const createFarmSchema = z.object({
  name: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(200),
  cropType: z.string().trim().min(2).max(100),
  area: z.number().positive(),
});

export const updateFarmSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  location: z.string().trim().min(2).max(200).optional(),
  cropType: z.string().trim().min(2).max(100).optional(),
  area: z.number().positive().optional(),
});

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;