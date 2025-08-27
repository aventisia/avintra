import { useLocation, useSearchParams } from "react-router-dom";

export const useSourceParam = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const source = searchParams.get("source");
  const isViewRoute = location.pathname === "/view";

  return {
    isFineTuneFlow: source === "fine-tune" && isViewRoute,
  };
};
