import { TableCNSkeleton } from "@avplatform/ui/table-cn";
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
    <Suspense fallback={<TableCNSkeleton />}>
      <Tenant />
    </Suspense>
  );
};
