import { stripLeadingSlash } from "@/utils/strip-leading-slash";

/**
 * Custom hook to open the template's original flow in AgentBuilder.
 *
 * This is used when a user wants to open the actual flow that was used to create
 * the template.
 * The URL is constructed using a base URL from environment variables.
 *
 * @returns A function that takes a path and opens the editable flow in a new tab.
 */
export const useOpenTemplate = () => {
  // Function to open the template flow in AgentBuilder
  const handleOpenTemplate = (path: string) => {
    const url =
      window.location.origin +
      `${import.meta.env.VITE_STUDIO_PATH}${stripLeadingSlash(path)}`;
    window.open(url, "_blank");
  };

  return handleOpenTemplate;
};
