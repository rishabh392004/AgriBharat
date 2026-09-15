import { z } from "zod";

export const createOfficerProfileSchema = z.object({
  badgeNumber:   z.string().min(3, "Badge number is required"),
  designation:   z.string().min(2, "Designation is required"),
  department:    z.string().min(2, "Department is required"),
  jurisdiction:  z.string().min(2, "Jurisdiction is required"),
  district:      z.string().min(2, "District is required"),
  state:         z.string().min(2, "State is required"),
  phone:         z.string().regex(/^\+?[0-9]{10,13}$/, "Invalid phone number").optional(),
  officeAddress: z.string().optional(),
});

export const updateOfficerProfileSchema = createOfficerProfileSchema.partial();
