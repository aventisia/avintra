import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCNSkeleton } from "@avplatform/ui/table-cn";
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
    <Suspense fallback={<TableCNSkeleton />}>
      <ModelProviders />
    </Suspense>
  );
};
