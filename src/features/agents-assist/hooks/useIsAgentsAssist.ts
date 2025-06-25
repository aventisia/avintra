import { useLocation } from "react-router-dom";

export const useIsAgentsAssist = (): boolean => {
  const location = useLocation();

  // Check if pathname contains 'agents-assist'
  return location.pathname.includes("agents-assist");
};
