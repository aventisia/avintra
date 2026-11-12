const COMPACT_SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi"];

/** Keeps up to 2 decimals and at most 4 whole digits, scaling 5+ digits to K, M, B... */
export const formatCredits = (credits: number) => {
  let value = credits;
  let tier = 0;
  while (Math.abs(Math.round(value * 100) / 100) >= 10_000 && tier < COMPACT_SUFFIXES.length - 1) {
    value /= 1000;
    tier++;
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${COMPACT_SUFFIXES[tier]}`;
};

/** Full credits value with up to 2 decimals, for tooltips. */
export const formatCreditsExact = (credits: number) =>
  credits.toLocaleString("en-US", { maximumFractionDigits: 2 });
