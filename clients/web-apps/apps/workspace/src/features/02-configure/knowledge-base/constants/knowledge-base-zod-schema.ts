import { maxLenError, reqError, variableError, variableRegex } from "@avplatform/ui/utils";
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

/**
 * Represents the Zod schema for a knowledgeBase.
 */
export const knowledgeBaseZodSchema = z
  .object({
    id: z.string(),
    name: knowledgeBaseNameSchema,
    description: z.string().optional(),
    vectorStore: z.string().min(1, { message: reqError("Vector Store") }),
    embeddingConfig: z.object({
      isByokEnabled: z.boolean().default(false),
      provider: z.string().min(1, { message: reqError("Embedding Provider") }),
      credentialName: z.string().optional(),
      model: z.string().min(1, { message: reqError("Embedding Model") }),
    }),
    storeCredentialName: z.string().optional(),
    collectionName: z.string().optional(),
    isDisabled: z.boolean().default(false).optional(),
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .superRefine((data, ctx) => {
    if (data.embeddingConfig.isByokEnabled && !data.embeddingConfig.credentialName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: reqError("Credential"),
        path: ["embeddingConfig", "credentialName"],
      });
    }
  });
