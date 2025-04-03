import { z } from "zod";

/**
 * Represents the Zod schema for a license.
 */
export const saLicenseZodSchema = z.object({
  id: z.string(),
  accountType: z.string(),
  name: z.string(),
  pricingComponent: z.string(),
  unitCost: z.number(),
  currentQuantity: z.number(),
  newQuantity: z.number(),
  additionaCost: z.number(),
});
