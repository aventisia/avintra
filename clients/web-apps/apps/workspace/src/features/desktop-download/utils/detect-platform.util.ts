export type Platform = "windows" | "linux" | "macos";

export const detectPlatform = (): Platform => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return "windows"; // default
};
