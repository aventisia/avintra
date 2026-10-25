import { maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

export const FOLDER_NAME_MAX_LENGTH = 50;
export const FOLDER_DESCRIPTION_MAX_LENGTH = 250;

/**
 * Represents the Zod schema for a folder.
 */
export const folderZodSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, { message: reqError("Folder name") })
    .max(FOLDER_NAME_MAX_LENGTH, { message: maxLenError("Folder name", FOLDER_NAME_MAX_LENGTH) }),
  description: z
    .string()
    .trim()
    .max(FOLDER_DESCRIPTION_MAX_LENGTH, {
      message: maxLenError("Description", FOLDER_DESCRIPTION_MAX_LENGTH),
    }),
  color: z.string(),
});
