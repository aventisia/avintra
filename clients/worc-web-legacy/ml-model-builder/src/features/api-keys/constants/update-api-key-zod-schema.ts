import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const updateAPIKeyZodSchema = z.object({
  id: z.string().readonly(),
  aiProjectVersionId: z.string().readonly(),
  name: z.string().min(1, { message: reqError("API Key Name") }),
});
