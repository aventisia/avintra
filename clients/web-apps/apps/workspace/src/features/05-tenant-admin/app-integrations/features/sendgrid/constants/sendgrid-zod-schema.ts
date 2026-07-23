import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

export const sendgridIntegrationZodSchema = z.object({
  id: z.string().readonly(),
  apiKey: z.string().min(1, { message: reqError("API Key") }),
});
