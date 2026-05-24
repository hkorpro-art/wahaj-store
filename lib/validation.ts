import { z } from "zod";
import type { InventoryStatus, ProductBadge, ProductStatus } from "./types";

export const productInputSchema = z.object({
  id: z.string().min(1).max(120),
  slug: z.string().min(1).max(160),
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  price: z.number().positive(),
  compareAt: z.number().positive().optional(),
  rating: z.number().nonnegative().default(5),
  reviews: z.number().int().min(0).default(0),
  badges: z.array(z.custom<ProductBadge>((value) => typeof value === "string")).default([]),
  status: z.array(z.custom<ProductStatus>((value) => typeof value === "string")).default([]),
  description: z.string().min(10).max(900),
  material: z.string().max(300).default(""),
  tags: z.array(z.string().min(1)).max(12).default([]),
  stock: z.number().int().min(0),
  inventoryStatus: z.custom<InventoryStatus>((value) => typeof value === "string"),
  images: z.array(z.string().url()).min(1).max(8),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  views: z.number().int().min(0).default(0),
  sold: z.number().int().min(0).default(0),
  visible: z.boolean().optional(),
  discountEndsAt: z.string().optional()
});

export const managedProductsInputSchema = z.object({
  products: z.array(productInputSchema)
});

export const orderInputSchema = z.object({
  customer: z.string().min(2).max(80),
  phone: z.string().min(7).max(24),
  products: z.array(z.string().min(1)).min(1),
  total: z.number().nonnegative(),
  notes: z.string().max(500).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const aiRequestSchema = z.object({
  type: z.enum(["description", "instagram", "whatsapp", "pricing", "image"]),
  productName: z.string().min(2).max(120),
  details: z.string().max(700).optional()
});
