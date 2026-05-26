import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a On Prem Model name.
 */
export const onPremLLMNameSchema = z
  .string()
  .min(1, { message: reqError("Display name") })
  .max(255, { message: maxLenError("Display name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Display name"),
  });

/**
 * Represents the Zod schema for a On Prem Model.
 */
export const onPremLLMZodSchema = z.object({
  id: z.string(),
  name: onPremLLMNameSchema,
  providerType: z.string().min(1, { message: reqError("Provider type") }),
  description: z
    .string()
    .max(500, { message: maxLenError("Description", 500) }),
  modelName: z.string().min(1, { message: reqError("Model name") }),
  providerUrl: z
    .string()
    .min(1, { message: reqError("URL") })
    .url("Invalid URL"),
  status: z.string().optional(),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});
