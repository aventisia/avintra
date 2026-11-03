import {
  type CrudCustomDialogProps,
  type CrudDialogEntityConfig,
  CrudDialogProvider,
  type CrudDialogRegistry,
} from "@avplatform/ui/crud-dialog";
import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Building2, Server } from "lucide-react";
import { Suspense, lazy } from "react";

import { CrudCardDialog, type CrudCardDialogConfig } from "@/components/card-dialog/CrudCardDialog";
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

const cardDialog = (config: CrudCardDialogConfig): CrudDialogEntityConfig => ({
  Dialog: (props: CrudCustomDialogProps) => <CrudCardDialog {...props} {...config} />,
});

const crudDialogRegistry: CrudDialogRegistry = {
  onPremTenant: cardDialog({
    Icon: Building2,
    widthClassName: "w-[min(32rem,calc(100vw-2rem))]",
    getHeader: getOnPremTenantDialogHeadingDescription,
    Content: OnPremTenantCrudDialogContent,
  }),
  tenantInstance: cardDialog({
    Icon: Server,
    widthClassName: "w-[min(32rem,calc(100vw-2rem))]",
    getHeader: getTenantInstanceDialogHeadingDescription,
    Content: TenantInstanceCrudDialogContent,
  }),
};

export function GlobalAdminCrudDialogProvider() {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <CrudDialogProvider registry={crudDialogRegistry} />
    </Suspense>
  );
}
