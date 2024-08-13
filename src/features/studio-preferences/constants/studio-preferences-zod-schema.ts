import { z } from "zod";

export const studioPreferencesZodSchema = z.object({
  layoutDirection: z.string().default("TB"),
  enableAutoArrange: z.boolean().default(false),
  hideMiniMap: z.boolean().default(false),
  hideUndoRedo: z.boolean().default(false),
  hideIntractivityToggle: z.boolean().default(false),
  hideZoomControls: z.boolean().default(false),
  disableDeleteAlert: z.boolean().default(false),
});
