import { useEffect, useState } from "react";

const useDocumentTitle = (title: string) => {
  const [docTitle, setDocTitle] = useState(title);

  //update docTitle on title change
  useEffect(() => {
    setDocTitle(title);
  }, [title]);

  useEffect(() => {
    document.title =
      docTitle +
      " - " +
      (import.meta.env.VITE_APP_NAME
        ? import.meta.env.VITE_COMPANY_NAME +
          " " +
          import.meta.env.VITE_APP_NAME
        : import.meta.env.VITE_COMPANY_NAME);
  }, [docTitle]);

  return [docTitle, setDocTitle];
};

export { useDocumentTitle };
