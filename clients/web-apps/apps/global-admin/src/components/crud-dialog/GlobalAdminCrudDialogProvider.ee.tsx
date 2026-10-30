import {
  CrudDialogProvider,
  type CrudDialogRegistry,
  DataTableSkeleton,
} from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

import { getDialogHeadingDescription as getTenantInstanceDialogHeadingDescription } from "@/features/global-admin/on-prem-tenant-instance/constants";
import { getDialogHeadingDescription as getOnPremTenantDialogHeadingDescription } from "@/features/global-admin/on-prem-tenant/constants";

const OnPremTenantCrudDialogContent = lazy(() =>
  import("@/features/global-admin/on-prem-tenant/components/on-prem-tenant-crud-dialog/OnPremTenantCrudDialogContent.ee").then(
    (m) => ({ default: m.OnPremTenantCrudDialogContent }),
  ),
);

const TenantInstanceCrudDialogContent = lazy(() =>
  import("@/features/global-admin/on-prem-tenant-instance/components/tenant-instance-crud-dialog/TenantInstanceCrudDialogContent.ee").then(
    (m) => ({ default: m.TenantInstanceCrudDialogContent }),
  ),
);

const crudDialogRegistry: CrudDialogRegistry = {
  onPremTenant: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getOnPremTenantDialogHeadingDescription,
    Content: OnPremTenantCrudDialogContent,
  },
  tenantInstance: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getTenantInstanceDialogHeadingDescription,
    Content: TenantInstanceCrudDialogContent,
  },
};

export function GlobalAdminCrudDialogProvider() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <CrudDialogProvider registry={crudDialogRegistry} />
    </Suspense>
  );
}
