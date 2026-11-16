import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the SpacesTable component.
const SpacesTable = lazy(() =>
  import("@/features/05-tenant-admin/spaces/components/SpacesTable").then((module) => ({
    default: module.SpacesTable,
  })),
);

/**
 * Renders the SpacesPage component.
 * @returns JSX element representing the SpacesPage component.
 */
export const SpacesPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <SpacesTable />
    </Suspense>
  );
};
