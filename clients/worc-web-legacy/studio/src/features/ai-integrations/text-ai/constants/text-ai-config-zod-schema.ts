import * as z from "zod";

const valueSchema = z.any();
const enabledSchema = z.boolean().default(true);

/**
 * Nested Schemas
 */
const modelConfigSchema = z.object({
  is_byok_enabled: z.boolean().default(false),
  provider: z.string().optional(),
  credential_id: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(1),
  top_p: z.number().min(0).max(1).default(1),
  is_json_output: z.boolean().default(true),
  max_output_tokens: z.number().nullable().optional(),
});

const kbConfigSchema = z.object({
  knowledgeBase: z.any().optional(),
  retrievalType: z.string().default("Basic"),
  sourceThreshold: z.number().default(1),
  numberOfChunks: z.number().default(10),
});

const memoryConfigSchema = z.object({
  memoryProvider: z.string().default("Memory Provider 1"),
  maxDataStored: z.number().default(4),
});

/**
 * MAIN SCHEMA
 */
export const textAiFormSchema = z
  .object({
    __Prompt__TextAi: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || val.length >= 16, {
        message: "Minimum 16 characters required",
      }),

    __ModelConfig__TextAi: modelConfigSchema.optional(),

    Files: z.string().optional(),

    __KbConfig__TextAi: kbConfigSchema.optional(),

    __MemoryConfig__TextAi: memoryConfigSchema.optional(),

    __ToolsConfig__TextAi: z.union([z.string(), z.record(z.any())]).optional(),

    toolChoiceStrategy: z.enum(["auto", "required", "none"]).default("auto"),

    useJSONSchema: z.boolean().default(false),

    SchemaName: z.string().optional(),

    json_schema: z.union([z.string(), z.record(z.any())]).optional(),

    Result: z
      .object({
        value: valueSchema,
        enabled: enabledSchema,
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.useJSONSchema) {
      if (!data.SchemaName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["SchemaName"],
          message: "Schema Name is required",
        });
      }

      if (!data.json_schema) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["json_schema"],
          message: "JSON Schema is required",
        });
      }
    }
  });

export type TextAiFormData = z.infer<typeof textAiFormSchema>;
