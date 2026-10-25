import { DeliveryChannelEnum } from "@avplatform/ui/enums";
import { z } from "zod";

const notificationSettingsSchema = z.object({
  lowCredits: z.boolean(),
  subscription: z.boolean(),
  publishAgent: z.boolean(),
  agentRiskAssessmentApproval: z.boolean(),
  // Required numeric configuration. Must be at least 1; null/0/negative are rejected.
  subscriptionRenewalReminderDays: z.coerce
    .number()
    .int()
    .min(1, "Subscription renewal reminder days cannot be less than 1."),
  lowCreditThreshold: z.coerce.number().min(1, "Low credit threshold cannot be less than 1."),
  // Optional delivery channel; defaults to Both when not specified.
  deliveryChannel: z.nativeEnum(DeliveryChannelEnum).default(DeliveryChannelEnum.Both),
});

export { notificationSettingsSchema };
