import { z } from "zod";

// ── VISA API RESPONSE SCHEMAS ─────────────────────────────
export const visaRawDataSchema = z.object({
  service_type: z.string(),
  country: z.string(),
  city: z.string().nullable(),
  product: z.string(),
  product_url: z.string(),
  product_category: z.string().nullable(),
});

export const visaProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  countrySlug: z.string(),
  city: z.string(),
  type: z.literal("visas"),
  productCategory: z.string(),
  visaType: z.string(),
  processingTime: z.string(),
  validity: z.string(),
  stayPeriod: z.string(),
  entryType: z.string(),
  normalPrice: z.number(),
  salePrice: z.number(),
  currency: z.string(),
  url: z.string(),
  image: z.string(),
  slug: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  isPopular: z.boolean(),
});

export const visaResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  rawData: z.object({
    result: z.object({
      data: z.object({
        json: z.array(visaRawDataSchema),
      }),
    }),
  }),
  products: z.array(visaProductSchema),
});

// ── EXPORT TYPES ──────────────────────────────────────────
export type VisaRawData = z.infer<typeof visaRawDataSchema>;
export type VisaProduct = z.infer<typeof visaProductSchema>;
export type VisaResponse = z.infer<typeof visaResponseSchema>;

// ── VISA TOOL PARAMETERS ──────────────────────────────────
export const getVisasSchema = z.object({
  country: z.string().optional().describe("Filter by specific country (e.g., 'dubai', 'usa', 'schengen')"),
  limit: z.number().optional().default(10).describe("Maximum number of visas to return (default 10)"),
});

export type GetVisasParams = z.infer<typeof getVisasSchema>;