import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the TemplatesApprovalTable component.
const TemplatesApprovalTable = lazy(() =>
  import("@/features/05-tenant-admin/templates-approval-table/components/TemplatesApprovalTable").then(
    (module) => ({
      default: module.TemplatesApprovalTable,
    }),
  ),
);

/**
 * Renders the TenantTemplatesApprovalPage component.
 *
 * No `isSuperAdmin` prop is passed, so the component will fetch
 * and display templates specific to the current tenant's scope.
 *
 * @returns JSX element representing the TenantTemplatesApprovalPage component.
 */
export const TenantTemplatesApprovalPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <TemplatesApprovalTable />
    </Suspense>
  );
};
