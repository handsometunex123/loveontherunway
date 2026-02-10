import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  category: z.enum(["MALE", "FEMALE"]).optional(),
  designerId: z.string().optional(),
  isVisible: z.boolean().optional()
});

export const productVariantSchema = z.object({
  size: z.string().min(1).max(50),
  color: z.string().min(1).max(50),
  measurements: z.record(z.string(), z.string()).or(z.record(z.string(), z.number())),
  stock: z.number().int().min(0).optional()
});

export const checkoutSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1)
      })
    )
    .min(1)
});

export const voteSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  productId: z.string().min(1)
});

export const designerUpdateSchema = z.object({
  isApproved: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  revocationReason: z.string().optional()
});

export const designerProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20),
  brandName: z.string().min(2).max(120),
  bio: z.string().min(10).max(2000),
  brandLogo: z.string().url().optional(),
  website: z.string().url().optional(),
  instagram: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  tiktok: z.string().max(100).optional()
});

export const settingsSchema = z.object({
  votingEnabled: z.boolean(),
  eventPhase: z.string().min(3).max(50)
});
