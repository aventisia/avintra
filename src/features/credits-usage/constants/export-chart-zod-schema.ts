import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const exportChartZodSchema = z.object({
    serviceType: z.string().min(1, {message: reqError("Service Type")}),
    users: z.array(z.string()).min(1, {message: reqError("Users")}),
    agents: z.array(z.string()).min(1, {message: reqError("Agents")}),
    aiModels: z.array(z.string()).min(1, {message: reqError("AI Models")}),
    startDate: z.string().min(1, {message: reqError("Start Date")}),
    endDate: z.string().min(1, {message: reqError("End Date")}),

})