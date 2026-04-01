import { useLocation } from "react-router-dom";

export const useIsExecutionLogsRoute = (): boolean => {
  const location = useLocation();

  // Check if pathname contains 'execution'
  return location.pathname.includes("execution");
};
