import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

import { Suspense, lazy } from "react";

// Lazy load the UsersTable component.
const UserManagement = lazy(() =>
  import("@/features/user-management/UserManagement").then((module) => ({
    default: module.UserManagement,
  })),
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
