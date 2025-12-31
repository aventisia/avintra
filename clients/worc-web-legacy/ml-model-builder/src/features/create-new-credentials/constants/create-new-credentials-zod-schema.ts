import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const createNewCredentailsFormZodSchema = z.object({
  name: z.string().min(1, { message: reqError("Name") }),
  baseUrl: z.string().min(1, { message: reqError("Base URL") }),
  apiKey: z.string().min(1, { message: reqError("API Key") }),
  organizationId: z.string().optional(),
});
