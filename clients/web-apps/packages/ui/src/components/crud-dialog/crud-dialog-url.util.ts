export const DIALOG_PARAM_KEYS = ["e", "ca", "rid", "back"];

export type BuildDialogCloseParamsInput = {
  /** Current URL search params to start from. */
  current: URLSearchParams;
  /** Optional encoded back state to restore on top of the cleaned params. */
  back?: string | null;
  /** Optional additional keys to remove besides the dialog keys. */
  extraKeys?: string[];
};

/**
 * Builds the search params that should remain after closing or completing a
 * URL-driven CRUD dialog.
 *
 * Removes the dialog keys (`e`, `ca`, `rid`, `back`) and any caller-supplied
 * extra keys, then merges the optional `back` snapshot on top so the previous
 * view state (filters, pagination, tabs) is restored.
 */
export function buildDialogCloseParams({
  current,
  back,
  extraKeys,
}: BuildDialogCloseParamsInput): URLSearchParams {
  const next = new URLSearchParams(current);

  DIALOG_PARAM_KEYS.forEach((key) => next.delete(key));
  extraKeys?.forEach((key) => next.delete(key));

  if (back) {
    const decoded = new URLSearchParams(back);
    decoded.forEach((value, key) => next.set(key, value));
  }

  return next;
}
