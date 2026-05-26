/** Formats byte sizes into human-readable strings (e.g., 1024 -> 1 KB) */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const base = 1000;
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );

  const value = bytes / Math.pow(base, i);

  return `${value.toFixed(2)} ${units[i]}`;
};