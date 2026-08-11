import { z } from "zod";

const notificationSettingsSchema = z.object({
  lowCredits: z.boolean(),
  subscription: z.boolean(),
  publishAgent: z.boolean(),
});

export { notificationSettingsSchema };
