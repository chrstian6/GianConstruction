// lib/validations/material.ts
import { z } from "zod";

const dimensionSchema = z.object({
  length: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
  unit: z.enum(["cm", "m", "in", "ft"]),
});

const weightSchema = z.object({
  value: z.number().min(0),
  unit: z.enum(["kg", "g", "lb", "oz"]),
});

const imageSchema = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
});

export const materialSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  unit: z.enum([
    "kg",
    "g",
    "lb",
    "piece",
    "box",
    "pallet",
    "liter",
    "gallon",
    "meter",
    "foot",
  ]),
  price: z.number().min(0.01),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0).int(),
  minStockLevel: z.number().min(0).int().optional(),
  supplier: z.string().max(100).optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  images: z.array(imageSchema).max(10).optional(),
  weight: weightSchema.optional(),
  dimensions: dimensionSchema.optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
