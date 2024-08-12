import { z } from "zod";

export const studioPreferencesZodSchema = z.object({
  layoutDirection: z.string().default("Top to Bottom"),
  enableAutoArrange: z.boolean().default(false),
  showMiniMap: z.boolean().default(true),
  showUndoRedo: z.boolean().default(true),
  showIntractivityToggle: z.boolean().default(true),
  showZoomControls: z.boolean().default(true),
  enableDeleteAlert: z.boolean().default(true),
});
