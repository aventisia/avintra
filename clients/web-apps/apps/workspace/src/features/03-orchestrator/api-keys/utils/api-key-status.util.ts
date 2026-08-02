import type { BadgeProps } from "@avplatform/ui/badge";

/**
 * Represents the computed display status of an API key.
 */
export type ApiKeyStatus = {
  label: string;
  variant: BadgeProps["variant"];
  className: string;
};

const ACTIVE_CLASS = "whitespace-nowrap border-transparent bg-green-100 text-green-700";
const REVOKED_CLASS = "whitespace-nowrap border-transparent bg-red-100 text-red-700";
const EXPIRED_CLASS = "whitespace-nowrap border-transparent bg-slate-100 text-slate-700";
const EXPIRING_SOON_CLASS = "whitespace-nowrap border-amber-200 bg-amber-100 text-amber-700";

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
    return { label: "Revoked", variant: "destructive", className: REVOKED_CLASS };
  }

  if (!expiresAt) {
    return { label: "Active", variant: "default", className: ACTIVE_CLASS };
  }

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs < 0) {
    return { label: "Expired", variant: "destructive", className: EXPIRED_CLASS };
  }

  if (diffMs < ONE_DAY_MS * EXPIRING_SOON_DAYS) {
    return { label: "Expiring Soon", variant: "outline", className: EXPIRING_SOON_CLASS };
  }

  return { label: "Active", variant: "default", className: ACTIVE_CLASS };
};
