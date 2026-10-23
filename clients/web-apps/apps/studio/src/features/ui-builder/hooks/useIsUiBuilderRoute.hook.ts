import { useLocation } from "react-router-dom";

/** Reports whether the studio route is the custom UI builder. */
export const useIsUiBuilderRoute = (): boolean => {
  const location = useLocation();

  return location.pathname.includes("ui-builder");
};
