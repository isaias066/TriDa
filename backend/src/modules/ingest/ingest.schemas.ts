import { z } from "zod";

export const TransactionIngestSchema = z.object({
  bank_code: z.string(),
  customer_name: z.string(),
  customer_email: z.string().email(),
  customer_phone: z.string(),
  customer_country: z.string(),
  customer_city: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("COP"),
  type: z.string(),
  channel: z.enum(["mobile", "web", "pos", "atm", "branch"]),
  account_origen: z.string(),
  account_destino: z.string(),
  device_fingerprint: z.string(),
  device_type: z.string(),
  os: z.string(),
  browser: z.string(),
  ip_address: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string(),
  country: z.string(),
  timestamp: z.string().datetime().optional(),
});

export type TransactionIngestInput = z.infer<typeof TransactionIngestSchema>;
