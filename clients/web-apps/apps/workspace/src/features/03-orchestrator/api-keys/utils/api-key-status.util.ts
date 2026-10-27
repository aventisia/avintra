import type { BadgeProps } from "@avplatform/ui/badge";

/**
 * Represents the computed display status of an API key.
 */
export type ApiKeyStatus = {
  label: string;
  variant: BadgeProps["variant"];
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
    return { label: "Revoked", variant: "destructive" };
  }

  if (!expiresAt) {
    return { label: "Active", variant: "completed" };
  }

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs < 0) {
    return { label: "Expired", variant: "secondary" };
  }

  if (diffMs < ONE_DAY_MS * EXPIRING_SOON_DAYS) {
    return { label: "Expiring Soon", variant: "review" };
  }

  return { label: "Active", variant: "completed" };
};
