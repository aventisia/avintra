import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const geminiIntegrationZodSchema = z.object({
  id: z.string().readonly(),
  host: z.string().min(1, { message: reqError("Host") }),
  apiKey: z.string().min(1, { message: reqError("API Key") }),
});
