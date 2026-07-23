import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useQueueBackLink = () => {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    params.delete("wid");

    return `/assist/queues?${params.toString()}`;
  }, [search]);
};
