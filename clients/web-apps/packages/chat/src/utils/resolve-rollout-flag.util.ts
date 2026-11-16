export type RolloutFlagInput = {
  /** Build-time default; only `"true"` turns the flag on. */
  envValue: string | undefined;
  /** The page's query string, e.g. `window.location.search`. */
  search: string;
  /** Query parameter whose `1` or `0` overrides the default and is remembered. */
  param: string;
  /** Returns the storage that remembers the last override. */
  getStorage?: () => Pick<Storage, "getItem" | "setItem">;
};

const parseOverride = (value: string | null | undefined) =>
  value === "1" ? true : value === "0" ? false : undefined;

/** Resolves a rollout flag: query override, then the remembered override, then the build default. */
export const resolveRolloutFlag = ({
  envValue,
  search,
  param,
  getStorage,
}: RolloutFlagInput): boolean => {
  const fallback = envValue === "true";
  const override = parseOverride(new URLSearchParams(search).get(param));
  const storageKey = `rollout:${param}`;

  try {
    const storage = getStorage?.();
    if (override !== undefined) storage?.setItem(storageKey, override ? "1" : "0");
    return override ?? parseOverride(storage?.getItem(storageKey)) ?? fallback;
  } catch {
    return override ?? fallback;
  }
};
