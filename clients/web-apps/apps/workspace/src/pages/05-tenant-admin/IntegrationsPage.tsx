import { NotFoundPage } from "@avplatform/layout";
import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the Integrations component.
const AppIntegrationsComponent = lazy(() =>
  import("@/features/05-tenant-admin/app-integrations/components/AppIntegrations").then(
    (module) => ({
      default: module.AppIntegrations,
    }),
  ),
);

/**
 * Renders the Integrations component.
 * @returns JSX element representing the LicensesPage component.
 */
export const AppIntegrationsPage = () => {
  if (import.meta.env.MODE === "production") {
    return <NotFoundPage />;
  }

  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <AppIntegrationsComponent />
    </Suspense>
  );
};
