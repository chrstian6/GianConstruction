import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional(),
  parentCategory: z.string().optional().nullable(),
  isActive: z.boolean().default(true),  
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
