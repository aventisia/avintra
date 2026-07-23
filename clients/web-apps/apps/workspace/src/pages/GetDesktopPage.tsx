import { Suspense, lazy } from "react";

// Lazy load the GetDesktop component.
const GetDesktop = lazy(() =>
  import("@/components/layout/GetDesktop").then((module) => ({
    default: module.GetDesktop,
  })),
);

/**
 * Renders the GetDesktopPage component.
 * @returns JSX element representing the GetDesktopPage component.
 */
export const GetDesktopPage = () => {
  return (
    <Suspense>
      <GetDesktop />
    </Suspense>
  );
};
