import { Suspense, lazy } from "react";

// Lazy load the FlowsTable component.
const AvPlatformLibrary = lazy(() =>
  import("@/features/01-build/templates-library/components/TemplatesLibrary").then((module) => ({
    default: module.default,
  })),
);

/**
 * Renders the LibraryPage component.
 * @returns JSX element representing the LibraryPage component.
 */
export const LibraryPage = () => {
  return (
    <Suspense>
      <AvPlatformLibrary />
    </Suspense>
  );
};
