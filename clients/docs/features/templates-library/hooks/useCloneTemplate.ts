"use client";
/**
 * Custom hook to Clone a template.
 *
 * The template is displayed at the `/workspace/library` route of avplatform.
 *
 * @returns A function that takes a template ID and opens the template in a new tab.
 */
export const useCloneTemplate = () => {
  const handleCloneTemplate = (id: string) => {
    // Get current hostname
    const hostname = window.location.hostname;
    // Decide base URL depending on environment
    let baseUrl = "https://avintra.aventisia.com/workspace/library"; // default prod
    if (hostname.includes("uat") || hostname == "localhost") {
      baseUrl = "https://uat-avintra.aventisia.com/workspace/library";
    }

    // Open the new URL
    const url = `${baseUrl}?t=${id}`;
    window.open(url, "_blank");
  };

  return handleCloneTemplate;
};
