import { lazy, Suspense } from "react";

// Lazy load the ModelLibraryTable component.
const LabelDataContainer = lazy(() =>
  import("@/features/label-data/components/LabelDataContainer").then(
    (module) => ({
      default: module.LabelDataContainer,
    }),
  ),
);
/**
 * Renders the Label data Page components.
 * @returns JSX element representing the Label data Page component.
 */
export const LabelDataPage = () => {
  return (
    <Suspense>
      <LabelDataContainer />
    </Suspense>
  );
};
