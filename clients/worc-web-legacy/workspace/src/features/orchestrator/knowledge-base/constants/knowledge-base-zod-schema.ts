import {
  maxLenError,
  reqError,
  variableError,
  variableRegex,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a knowledgeBase name.
 */
export const knowledgeBaseNameSchema = z
  .string()
  .min(1, { message: reqError("Name") })
  .max(255, { message: maxLenError("Name", 255) })
  .regex(variableRegex, {
    message: variableError("Name"),
  });

const modelConfigSchema = z
  .object({
    is_byok_enabled: z.boolean().default(false),
    credential_id: z.string().optional(),
    provider: z.string().min(1, { message: reqError("Provider") }),
    model: z.string().min(1, { message: reqError("Model") }),
  })
  .superRefine((data, ctx) => {
    if (data.is_byok_enabled && !data.credential_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: reqError("Credential"),
        path: ["credential_id"],
      });
    }
  });
/**
 * Represents the Zod schema for a knowledgeBase.
 */
export const knowledgeBaseZodSchema = z.object({
  id: z.string(),
  name: knowledgeBaseNameSchema,
  description: z.string().min(1, { message: reqError("Description") }),
  vectorStore: z.string().min(1, { message: reqError("vectorStore") }),
  embeddingModel: z.string().min(1, { message: reqError("embeddingModel") }),
  isDisabled: z.boolean().default(false).optional(),

  kb: modelConfigSchema,

  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});
