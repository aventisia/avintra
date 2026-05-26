import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const exportChartZodSchema = z.object({
  serviceType: z.array(z.string()),
  users: z.array(z.string()).min(1, { message: reqError("Users") }),
  agents: z.array(z.string()).min(1, { message: reqError("Agents") }),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});
