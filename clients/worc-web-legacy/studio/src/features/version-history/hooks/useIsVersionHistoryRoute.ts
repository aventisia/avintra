import { useLocation } from "react-router-dom";

export const useIsVersionHistoryRoute = (): boolean => {
  const location = useLocation();

  // Check if pathname contains 'agent-history'
  return location.pathname.includes("agent-history");
};
