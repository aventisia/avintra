import { isRouteWithin } from "@avplatform/ui/utils";
import { Link, NavLink, useLocation } from "react-router-dom";

/**
 * Link component and `aria-current` for a sidebar entry; a hub entry passes `activeRoutes` to be
 * current on any of them instead of on its own route.
 */
export const useMenuItemLink = (activeRoutes?: string[]) => {
  const { pathname } = useLocation();
  const isHubActive = activeRoutes?.some((route) => isRouteWithin(pathname, route));

  return {
    LinkComponent: activeRoutes ? Link : NavLink,
    ariaCurrent: isHubActive ? ("page" as const) : undefined,
  };
};
