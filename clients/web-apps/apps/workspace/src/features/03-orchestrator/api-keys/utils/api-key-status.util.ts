import type { BadgeProps } from "@avplatform/ui/badge";
import type { RecordTone } from "@avplatform/ui/record-sheet";

/**
 * Represents the computed display status of an API key.
 */
export type ApiKeyStatus = {
  label: string;
  variant: BadgeProps["variant"];
  tone: RecordTone;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_DAYS = 30;

/**
 * Returns a human-readable status badge configuration for an API key.
 * @param expiresAt - ISO expiration date string or null.
 * @param isRevoked - Whether the key has been revoked.
 * @returns The status configuration to render in a badge.
 */
export const getApiKeyStatus = (expiresAt: string | null, isRevoked: boolean): ApiKeyStatus => {
  if (isRevoked) {
    return { label: "Revoked", variant: "destructive", tone: "bad" };
  }

  if (!expiresAt) {
    return { label: "Active", variant: "completed", tone: "ok" };
  }

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs < 0) {
    return { label: "Expired", variant: "secondary", tone: "neutral" };
  }

  if (diffMs < ONE_DAY_MS * EXPIRING_SOON_DAYS) {
    return { label: "Expiring soon", variant: "review", tone: "warn" };
  }

  return { label: "Active", variant: "completed", tone: "ok" };
};
