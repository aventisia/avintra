import { reqError } from "@/react-toolkit/utils/error-message-list";
import { z } from "zod";


export const machineAssingmentZodSchema = z.object({
  id: z.string(),
  flowId: z.string().min(1, { message: reqError("Flow/Agent") }),
  // Read (view) only fields
  flowCount: z.number().default(0),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});
