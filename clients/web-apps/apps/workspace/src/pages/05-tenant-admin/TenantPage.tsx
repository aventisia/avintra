import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the Billings component.
const Tenant = lazy(() =>
  import("@/features/05-tenant-admin/tenant/components/Billing.ee").then((module) => ({
    default: module.Billing,
  })),
);

/**
 * Renders the BillingPage component.
 * @returns JSX element representing the BillingPage component.
 */
export const TenantPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <Tenant />
    </Suspense>
  );
};
