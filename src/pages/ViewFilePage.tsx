import { Suspense, lazy } from "react";

// Lazy load the View file component.
const ViewFileContainer = lazy(() =>
  import("@/features/view-file/components").then((module) => ({
    default: module.ViewFile,
  })),
);

/**
 * Renders the view file page.
 * @returns JSX element representing the View File Page component.
 */
export const ViewFilePage = () => {
  return (
    <Suspense>
      <ViewFileContainer />
    </Suspense>
  );
};
