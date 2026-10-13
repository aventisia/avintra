import { useEffect, useState } from "react";

import { useBranding } from "./useBranding";

/**
 * Custom hook to set the document title.
 *
 * @param {string} title - The initial title to set for the document.
 * @returns {[string, React.Dispatch<React.SetStateAction<string>>]} - An array containing the current document title and a function to update it.
 *
 * @example
 * const [docTitle, setDocTitle] = useDocumentTitle("My Page");
 * setDocTitle("New Page Title");
 *
 * @remarks
 * The document title is set to the provided title followed by the application name and company name, if available.
 * The format is: `title - APP_NAME | COMPANY_NAME` or `title - COMPANY_NAME`.
 * The names come from the branding store, which already resolves the build-time Vite defaults
 * (see `resolveBranding`).
 */
const useDocumentTitle = (title: string) => {
  const [docTitle, setDocTitle] = useState(title);

  // Deployment branding; falls back to the build-time Vite defaults when not configured.
  const { appName, companyName } = useBranding();

  useEffect(() => {
    document.title = docTitle + " - " + (appName ? appName + " | " + companyName : companyName);
  }, [appName, companyName, docTitle]);

  return [docTitle, setDocTitle];
};

export { useDocumentTitle };
