import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Suspense, lazy } from "react";

// Lazy load the ModelProviders component.
const ModelProviders = lazy(() =>
  import("@/features/05-tenant-admin/model-providers/components/ModelProviders").then((module) => ({
    default: module.ModelProviders,
  })),
);

/**
 * Renders the Model Providers page under Tenant Admin.
 * @returns JSX element representing the Model Providers page.
 */
export const ModelProvidersPage = () => {
  useDocumentTitle("Models");

  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ModelProviders />
    </Suspense>
  );
};
