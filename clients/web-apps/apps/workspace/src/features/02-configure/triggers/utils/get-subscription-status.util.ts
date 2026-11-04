import type { RecordTone } from "@avplatform/ui/record-sheet";

type SubscribedTrigger = {
  isDisabled?: boolean | null;
  expiryDateTime: Date | string;
};

/**
 * Returns the subscription's status label and tone, and whether its expiry date has passed.
 */
export const getSubscriptionStatus = (
  trigger: SubscribedTrigger,
): { title: string; tone: RecordTone; isExpired: boolean } => {
  const isExpired = new Date(trigger.expiryDateTime) < new Date();
  if (trigger.isDisabled) return { title: "Disabled", tone: "neutral", isExpired };
  if (isExpired) return { title: "Expired", tone: "warn", isExpired };
  return { title: "Active", tone: "ok", isExpired };
};
