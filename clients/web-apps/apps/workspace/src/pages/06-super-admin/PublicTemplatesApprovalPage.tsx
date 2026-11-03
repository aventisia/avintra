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
 * Renders the PublicTemplatesApprovalPage component.
 *
 * The `isSuperAdmin` prop is passed to fetch and display templates
 * visible only to super admins for public template approval.
 *
 * @returns JSX element representing the PublicTemplatesApprovalPage component.
 */
export const PublicTemplatesApprovalPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <TemplatesApprovalTable isSuperAdmin />
    </Suspense>
  );
};
