import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const saveAsTemplateZodSchema = z
  .object({
    refId: z.string().readonly(),
    name: z.string().min(1, { message: reqError("Template Name") }),
    description: z.string().optional(),
    accessType: z.string().min(1, { message: reqError("Access Level") }),
    spaceIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(), // tags optional, can be empty array
  })
  .superRefine((data, ctx) => {
    if (
      data.accessType === "Space" &&
      (!data.spaceIds || data.spaceIds.length === 0)
    ) {
      ctx.addIssue({
        path: ["spaceIds"],
        code: z.ZodIssueCode.custom,
        message: reqError("Spaces"),
      });
    }
  });
