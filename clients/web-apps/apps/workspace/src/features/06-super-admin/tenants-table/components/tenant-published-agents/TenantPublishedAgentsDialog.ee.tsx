import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, useTableCN } from "@avplatform/ui/table-cn";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { useFetchTenantPublishedAgents } from "../../hooks/useFetchTenantPublishedAgents.ee";
import { SetFixedCreditsDialog } from "./SetFixedCreditsDialog.ee";
import {
  TENANT_PUBLISHED_AGENTS_INITIAL_STATE,
  TENANT_PUBLISHED_AGENTS_TABLE_KEY,
  tenantPublishedAgentsColumns,
} from "./TenantPublishedAgentsColumns.ee";

export const TenantPublishedAgentsDialog = () => {
  const { tid } = useParams<{ tid: string }>();
  const [searchParams] = useSearchParams();
  const tname = searchParams.get("tname") ?? "Tenant";

  useDocumentTitle("Published agents");

  const { data, isLoading } = useFetchTenantPublishedAgents(tid ?? "");

  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: tenantPublishedAgentsColumns,
    initialState: TENANT_PUBLISHED_AGENTS_INITIAL_STATE,
    persistKey: TENANT_PUBLISHED_AGENTS_TABLE_KEY,
  });

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
        <TableCNSkeleton columnCount={6} withViewOptions={false} />
      ) : (
        <TableCN table={table} label="Published agents" />
      )}

      {/* Set Fixed Credits dialog (store-driven) */}
      <SetFixedCreditsDialog />
    </div>
  );
};
