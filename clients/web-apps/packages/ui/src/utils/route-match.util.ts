/** Whether `pathname` is `route` itself or one of its sub-pages. */
export const isRouteWithin = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);
