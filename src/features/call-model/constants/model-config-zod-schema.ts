import * as z from "zod";
const valueSchema = z.any();
const enabledSchema = z.boolean().default(true);

export const modelFormSchema = z.object({
  MLModel: z.any(),
  inputText: z.string().min(1, "Input is required"),
  modelApiKey: z.string().min(1, "API key is required"),
  llm: z.string().optional(),

  AIModelResult: z
    .object({
      value: valueSchema,
      enabled: enabledSchema,
    })
    .optional(),
  ResponseCode: z
    .object({
      value: valueSchema,
      enabled: enabledSchema,
    })
    .optional(),
});

export type modelFormData = z.infer<typeof modelFormSchema>;
