import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const openAIIntegrationZodSchema = z.object({
  id: z.string().readonly(),
  apiKey: z.string().min(1, { message: reqError("API Key") }),
  organizationId: z.string().default(""),
  baseURL: z.string().default(""),
});
