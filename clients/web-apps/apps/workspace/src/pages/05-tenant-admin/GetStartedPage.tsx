import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the GetStartedPage component.
const GetStartedPage = lazy(() =>
  import("@/features/05-tenant-admin/get-started/components/GetStartedPage").then((module) => ({
    default: module.GetStartedPage,
  })),
);

/**
 * Renders the Get Started onboarding page for Tenant Admins.
 * @returns JSX element representing the Get Started page.
 */
export const GetStartedPageLazy = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <GetStartedPage />
    </Suspense>
  );
};
