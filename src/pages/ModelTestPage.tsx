import { Suspense, lazy } from "react";

// Lazy load the ModelTestContainer component.
const ModelTestContainer = lazy(() =>
  import("@/features/model-test/components/ModelTestContainer").then(
    (module) => ({
      default: module.ModelTestContainer,
    }),
  ),
);
/**
 * Renders the Model Test Page components.
 * @returns JSX element representing the Model test Page component.
 */
export const ModelTestPage = () => {
  return (
    <Suspense>
      <ModelTestContainer />
    </Suspense>
  );
};
