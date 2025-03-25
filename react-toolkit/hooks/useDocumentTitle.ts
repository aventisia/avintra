import { useEffect, useState } from "react";

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
 */
const useDocumentTitle = (title: string) => {
  const [docTitle, setDocTitle] = useState(title);

  useEffect(() => {
    document.title =
      docTitle +
      " - " +
      (import.meta.env.VITE_APP_NAME
        ? import.meta.env.VITE_APP_NAME +
          " | " +
          import.meta.env.VITE_COMPANY_NAME
        : import.meta.env.VITE_COMPANY_NAME);
  }, [docTitle]);

  return [docTitle, setDocTitle];
};

export { useDocumentTitle };
