import { useCallback } from "react";
import { useLocation } from "react-router-dom";

export const useOpenWorkItem = () => {
  const location = useLocation();

  const getWorkItemUrl = useCallback(
    (workItemId: string) => {
      const params = new URLSearchParams(location.search);
      params.set("wid", workItemId);

      return `/assist/queues?${params.toString()}`;
    },
    [location.search],
  );

  return {
    getWorkItemUrl,
  };
};
