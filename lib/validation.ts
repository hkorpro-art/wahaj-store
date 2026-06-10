import { z } from "zod";
import type { InventoryStatus, ProductBadge, ProductStatus } from "./types";

const storedImageSchema = z.object({
  url: z.string().url(),
  fileId: z.string()
});

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
  images: z.array(storedImageSchema).min(1).max(8),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  views: z.number().int().min(0).default(0),
  sold: z.number().int().min(0).default(0),
  visible: z.boolean().optional(),
  discountEndsAt: z.string().optional(),
  categoryIds: z.array(z.string()).optional()
});

export const managedProductsInputSchema = z.object({
  products: z.array(productInputSchema)
});

export const orderInputSchema = z.object({
  id: z.string().optional(),
  customer: z.string().min(2).max(80),
  phone: z.string().min(7).max(24),
  products: z.array(z.string().min(1)).min(1),
  total: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().max(500).optional(),
  status: z.string().optional(),
  createdAt: z.string().optional()
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

export const heroSlideInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(120),
  subtitle: z.string().max(200),
  image: z.object({ url: z.string(), fileId: z.string() }),
  mobileImage: z.object({ url: z.string(), fileId: z.string() }).optional(),
  focusX: z.number().min(0).max(100),
  focusY: z.number().min(0).max(100),
  autoContrast: z.boolean(),
  ctaText: z.string().max(60),
  destinationType: z.enum(["product", "category", "url"]),
  destinationValue: z.string().max(200),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const heroSettingsInputSchema = z.object({
  transitionSpeed: z.number().min(200).max(2000),
  autoPlay: z.boolean(),
  autoPlayInterval: z.number().min(2000).max(15000),
  floatingEffect: z.boolean(),
  backgroundBlur: z.number().min(0).max(12),
  sideScale: z.number().min(0.3).max(1),
  showHero: z.boolean()
});

export const managedHeroSlidesInputSchema = z.object({
  slides: z.array(heroSlideInputSchema)
});

export const collectionInputSchema = z.object({
  id: z.string().min(1).max(120),
  slug: z.string().min(1).max(160),
  name: z.string().min(2).max(120),
  image: storedImageSchema,
  description: z.string().max(900).optional(),
  sortOrder: z.number().int().min(0),
  visible: z.boolean(),
  linkedProducts: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const managedCollectionsInputSchema = z.object({
  collections: z.array(collectionInputSchema)
});

/** @deprecated Use collectionInputSchema */
export const categoryInputSchema = collectionInputSchema;
/** @deprecated Use managedCollectionsInputSchema */
export const managedCategoriesInputSchema = z.object({
  categories: z.array(categoryInputSchema)
});

