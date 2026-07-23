import { maxLenError, reqError, variableError, variableRegex } from "@avplatform/ui/utils";
import { z } from "zod";

// Regex to check that '__config__ should not contain in name
const noConfigRegex = /^(?!.*__config__).*$/;

/**
 * Represents the Zod object's item schema for a keystore name.
 */
export const keystoreNameSchema = z
  .string()
  .min(1, { message: reqError("Key name") })
  .max(255, { message: maxLenError("Key name", 255) })
  .regex(variableRegex, {
    message: variableError("Key name"),
  })
  .regex(noConfigRegex, {
    message: "Key name should not contain '__config__'.",
  });

/**
 * Represents the Zod schema for a keystore.
 */
export const keystoreZodSchema = z
  .object({
    id: z.string(),
    type: z.string().min(1, { message: reqError("Key type") }),
    name: keystoreNameSchema,
    value: z.string().min(1, { message: reqError("Value") }),
    isDisabled: z.boolean().default(false),
    isEncrypted: z.optional(z.boolean().default(false)),
    description: z.string().optional().nullable(),
    tags: z.string().optional(),

    // Read (view) only fields
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine(
    (data) => {
      if (data.type == "JSON") {
        try {
          JSON.parse(data.value);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Invalid JSON format",
      path: ["value"],
    },
  );
