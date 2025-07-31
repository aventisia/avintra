import { lazy, Suspense } from "react";

// Lazy load the FlowsTable component.
const WorcLibrary = lazy(() =>
  import("@/features/worc-library/components").then((module) => ({
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
      <WorcLibrary />
    </Suspense>
  );
};
