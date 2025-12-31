import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const storageConnectFormZodSchema = z
  .object({
    credentails: z.string().min(1, { message: reqError("Credentails") }),
    scope: z.string().min(1, { message: reqError("Scope") }),
    fileId: z.string().optional(),
    folderId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "File" && (!data.fileId || data.fileId.trim() === "")) {
      ctx.addIssue({
        path: ["fileId"],
        message: reqError("File Id"),
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.scope === "Folder" &&
      (!data.folderId || data.folderId.trim() === "")
    ) {
      ctx.addIssue({
        path: ["folderId"],
        message: reqError("Folder Id"),
        code: z.ZodIssueCode.custom,
      });
    }
  });
