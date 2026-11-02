import { FRESH_LOGIN_SESSION_KEY, ONBOARDING_LS_KEY_PREFIX } from "@/ui/constants";

/** How the user permanently settled the Get Started guide. */
type OnboardingDisposition = "completed" | "dismissed" | null;

/** Days that "Remind me later" keeps the Get Started guide closed. */
const ONBOARDING_REMINDER_DAYS = 7;

const ONBOARDING_REMINDER_MS = ONBOARDING_REMINDER_DAYS * 24 * 60 * 60 * 1000;

const FRESH_LOGIN_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * Whether the Get Started guide should open on this sign-in. A permanent decision wins,
 * then an unexpired snooze; otherwise the guide is due.
 */
const isOnboardingDue = (
  {
    disposition,
    snoozedUntil,
  }: { disposition: OnboardingDisposition; snoozedUntil: number | null },
  now = Date.now(),
) => disposition === null && (snoozedUntil === null || now >= snoozedUntil);

/** Marks the current tab as arriving from a real sign-in rather than a token refresh. */
const markFreshLogin = () => sessionStorage.setItem(FRESH_LOGIN_SESSION_KEY, String(Date.now()));

/**
 * Reads and clears the sign-in marker; a marker older than a few minutes, left by a sign-in
 * that went to another app, no longer counts.
 */
const consumeFreshLogin = (now = Date.now()) => {
  const markedAt = Number(sessionStorage.getItem(FRESH_LOGIN_SESSION_KEY));
  sessionStorage.removeItem(FRESH_LOGIN_SESSION_KEY);
  return now - markedAt <= FRESH_LOGIN_MAX_AGE_MS;
};

/** Clears local storage but keeps every user's saved Get Started guide choices. */
const clearLocalStorageKeepingOnboarding = () => {
  const keptEntries: [string, string][] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    const value = key?.startsWith(ONBOARDING_LS_KEY_PREFIX) ? localStorage.getItem(key) : null;
    if (key && value !== null) keptEntries.push([key, value]);
  }
  localStorage.clear();
  keptEntries.forEach(([key, value]) => localStorage.setItem(key, value));
};

export {
  ONBOARDING_REMINDER_DAYS,
  ONBOARDING_REMINDER_MS,
  clearLocalStorageKeepingOnboarding,
  consumeFreshLogin,
  isOnboardingDue,
  markFreshLogin,
  type OnboardingDisposition,
};
