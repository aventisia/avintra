export const formatCount = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export const formatStorage = (megabytes: number) =>
  megabytes >= 1024
    ? `${(megabytes / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} GB`
    : `${formatCount(megabytes)} MB`;

/** "month" or "year", for the plan's billing frequency. */
export const getBillingPeriod = (frequency?: string) =>
  frequency?.toLowerCase() === "monthly" ? "month" : "year";

/** Plan limits of zero or less mean the plan sets no limit. */
export const isUnlimited = (limit: number) => limit <= 0;
