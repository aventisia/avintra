import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";


export const scheduleFineTuneFormZodSchema = z.object({
  mlModelId: z.string().readonly(),
  fileIds: z.array(z.string()),
  timeZone: z.string().min(1, {message: reqError("Timezone")}),
  scheduledAt: z.date({required_error : "Schedule On is required"}),
});
