import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the TenantInfo component.
const TenantInfo = lazy(() =>
  import("@/features/tenant-info/TenantInfo").then((module) => ({
    default: module.TenantInfo,
  })),
);

/**
 * Renders the TenantInfoPage component.
 * @returns JSX element representing the TenantInfoPage component.
 */
export const TenantInfoPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TenantInfo />
    </Suspense>
  );
};
