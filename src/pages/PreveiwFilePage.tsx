import { Suspense, lazy } from "react";

// Lazy load the View file component.
const PreviewFileContainer = lazy(() =>
  import("@/features/preview-file/components").then((module) => ({
    default: module.PreviewFile,
  })),
);

/**
 * Renders the view file page.
 * @returns JSX element representing the View File Page component.
 */
export const PreviewFilePage = () => {
  return (
    <Suspense>
      <PreviewFileContainer />
    </Suspense>
  );
};
