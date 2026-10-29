import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { DataTable, DataTableSkeleton } from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { useFetchTenantPublishedAgents } from "../../hooks/useFetchTenantPublishedAgents.ee";
import { SetFixedCreditsDialog } from "./SetFixedCreditsDialog.ee";
import { tenantPublishedAgentsColumns } from "./TenantPublishedAgentsColumns.ee";

export const TenantPublishedAgentsDialog = () => {
  const { tid } = useParams<{ tid: string }>();
  const [searchParams] = useSearchParams();
  const tname = searchParams.get("tname") ?? "Tenant";

  useDocumentTitle("Published agents");

  const { data, isLoading } = useFetchTenantPublishedAgents(tid ?? "");

  const table = useDataTable(tenantPublishedAgentsColumns, data?.data || [], {}, [], false);

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/sa/tenants">Tenants</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-96 truncate capitalize">
              {tname} - Published Agents
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable table={table} columnsLength={tenantPublishedAgentsColumns.length} />
      )}

      {/* Set Fixed Credits dialog (store-driven) */}
      <SetFixedCreditsDialog />
    </div>
  );
};
