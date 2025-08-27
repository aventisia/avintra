import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/**
 * Removes `fid` and `source` query parameters when the route is not `/view`
 */
export const useClearQueryParamsOutsideView = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const isViewRoute = location.pathname === "/view";

    const hasFid = searchParams.has("fid");
    const hasSource = searchParams.has("source");

    if (!isViewRoute && (hasFid || hasSource)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("fid");
      newParams.delete("source");

      navigate(
        {
          pathname: location.pathname,
          search: newParams.toString(),
        },
        { replace: true },
      );
    }
  }, [location.pathname, searchParams, navigate]);
};
