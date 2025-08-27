import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const createNewAPIKeyZodSchema = z.object({
  mlModelId: z.string().readonly(),
  name: z.string().min(1, { message: reqError("API Key Name") }),
});
