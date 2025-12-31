import { z } from "zod";

export const studioPreferencesZodSchema = z.object({
  layoutDirection: z.enum(["TB", "LR"]).default("TB"),
  miniMap: z.boolean().default(false),
  undoRedo: z.boolean().default(false),
  cursorToggle: z.boolean().default(false),
  zoomControls: z.boolean().default(false),
  deleteAlert: z.boolean().default(false),
});
