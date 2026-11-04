import type { RecordTone } from "@avplatform/ui/record-sheet";

/** Whether the account's lockout end lies in the future. */
export const isAccountLocked = (lockoutEnd?: Date) =>
  !!lockoutEnd && new Date() < new Date(lockoutEnd);

/** Account status label and tone; a disabled account outranks a locked one. */
export const getAccountStatus = (
  isDisabled: boolean,
  lockoutEnd?: Date,
): { label: string; tone: RecordTone } => {
  if (isDisabled) return { label: "Disabled", tone: "bad" };
  if (isAccountLocked(lockoutEnd)) return { label: "Locked", tone: "warn" };
  return { label: "Enabled", tone: "ok" };
};
