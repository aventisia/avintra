import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the UsersTable component.
const UserManagement = lazy(() =>
  import("@/features/05-tenant-admin/user-management/UserManagement").then(
    (module) => ({
      default: module.UserManagement,
    }),
  ),
);

/**
 * Renders the UsersPage component.
 * @returns JSX element representing the UsersPage component.
 */
export const UsersPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <UserManagement />
    </Suspense>
  );
};
