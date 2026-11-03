import { Checkbox, DotSeparator, EmptyState } from "@avplatform/ui";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCNHeading,
  TableCNPagination,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { AlertCircleIcon, CheckCircleIcon, Clock3Icon } from "lucide-react";

import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";
import { Tooltip } from "@/ui/components/tooltip";

import {
  TABLE_HEADING,
  TABLE_KEY,
  VAULT_INITIAL_STATE,
  VAULT_PAGE_SIZE_OPTIONS,
} from "../constants";
import { useFetchVaultCredentials } from "../hooks/useFetchVaultCredentials.hook";
import { useTableTab } from "../hooks/useTableTab";
import { getVaultCredentialAppIcon } from "../vault-credential-config/constants/vault-credential-app-icon-mapper.constant";
import { vaultCredentialTableColumns } from "./VaultCredentialTableColumns";
import { VaultCredentialTableSkeleton } from "./VaultCredentialTableSkeleton";
import { VaultCredentialBulkActions } from "./vault-credential-row-actions/VaultCredentialBulkActions";
import { VaultCredentialRowActions } from "./vault-credential-row-actions/VaultCredentialRowActions";

const PAGINATION_PROPS = {
  pageSizeOptions: VAULT_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "credential", plural: "credentials" },
};

/**
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const VaultCredentialTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { queryKey } = useTableTab();

  const { data, isFetching, isLoading } = useFetchVaultCredentials();
  const isVaultCredentialsLoading = isLoading || isFetching;

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data || [],
    columns: vaultCredentialTableColumns(),
    getRowId: (credential) => credential.id ?? "",
    initialState: VAULT_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  return (
    <>
      {!isVaultCredentialsLoading ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>

            <div className="flex items-center gap-2">
              <CrudCreateButton buttonText="Add credential" entity="vault" />
            </div>
          </div>
          {/* Search for the card list */}
          <TableCNToolbar table={table} searchPlaceholder="Search..." withViewOptions={false} />
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-surface px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border bg-surface px-3.5 py-2.5 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label={`Select ${row.original.name ?? "credential"}`}
                    />
                    <div>
                      <img
                        src={
                          basePath +
                          (getVaultCredentialAppIcon(String(row.getValue("type"))) ??
                            "/brand-img/default-provider.svg")
                        }
                        alt="icon"
                        className="size-6"
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 ">
                        <div
                          title={row.getValue("name")}
                          className="w-auto truncate text-sm font-medium"
                        >
                          {row.getValue("name")}
                        </div>

                        {row.original.corsairStatus === "Connected" && (
                          <Tooltip content="OAuth connected">
                            <CheckCircleIcon
                              className="h-3.5 w-3.5 text-ok"
                              aria-label="OAuth connected"
                            />
                          </Tooltip>
                        )}

                        {row.original.corsairStatus === "Failed" && (
                          <Tooltip
                            content={row.original.corsairStatusReason ?? "Connection failed"}
                          >
                            <AlertCircleIcon
                              className="h-3.5 w-3.5 text-bad"
                              aria-label="Connection failed"
                            />
                          </Tooltip>
                        )}

                        {row.original.corsairStatus === "Expired" && (
                          <Tooltip content="Connection expired; reconnect required">
                            <AlertCircleIcon
                              className="h-3.5 w-3.5 text-bad"
                              aria-label="Connection expired"
                            />
                          </Tooltip>
                        )}

                        {row.original.corsairStatus === "Pending" && (
                          <Tooltip content="Connection pending">
                            <Clock3Icon
                              className="h-3.5 w-3.5 text-warn"
                              aria-label="Connection pending"
                            />
                          </Tooltip>
                        )}

                        <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem]  flex items-center justify-center  text-ink-2  rounded-sm">
                          {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
                        </span>
                      </div>{" "}
                      <div className="flex items-center">
                        <span className="text-2xs text-muted-foreground">
                          {row.getValue("type") as string}
                        </span>
                        <DotSeparator />
                        <span className="text-2xs text-muted-foreground">
                          Created on {formatDate(row.getValue("createdOn"))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <VaultCredentialRowActions
                    rowId={row.original.id || "rowId"}
                    accessLevel={row.original.accessLevel}
                    name={row.original.name}
                    type={row.original.type}
                    isTenantWideAccess={row.original.isTenantWideAccess || false}
                    isResourceAccessRestricted={row.original.isResourceAccessRestricted || false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="rounded-lg border bg-surface py-8"
              primaryMessage="No credentials found"
              secondaryMessage="Please add new credentials."
            />
          )}
          <TableCNPagination table={table} {...PAGINATION_PROPS} />

          <VaultCredentialBulkActions table={table} />

          <ResourceUserAccessDialog queryKey={queryKey} />
          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        <VaultCredentialTableSkeleton />
      )}
    </>
  );
};
