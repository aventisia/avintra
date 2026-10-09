import { DotSeparator } from "@avplatform/ui";
import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { formatDate } from "@avplatform/ui/utils";
import { AlertCircleIcon, CheckCircleIcon, Clock3Icon } from "lucide-react";

import { HelpButton } from "@/components/help/HelpButton";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";
import { Tooltip } from "@/ui/components/tooltip";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchVaults } from "../hooks/useFetchVaults";
import { useTableTab } from "../hooks/useTableTab";
import { getVaultAppIcon } from "../vault-config/constants/vault-app-icon-mapper";
import { VaultTableSkeleton } from "./VaultTableSkeleton";
import { vaultsTableColumns } from "./VaultsTableColumns";
import { VaultRowActions } from "./vault-row-actions/VaultRowActions";
import { VaultsBulkActions } from "./vault-row-actions/VaultsBulkActions";

/**
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const VaultTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  const { queryKey } = useTableTab();

  const { data, isFetching, isLoading } = useFetchVaults();
  const isVaultsLoading = isLoading || isFetching;

  const vaultsTableColumnsArray = vaultsTableColumns();

  const table = useDataTable(
    vaultsTableColumnsArray,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  return (
    <>
      {!isVaultsLoading ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="vault" />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search..." />
              <DTCreateButton buttonText="Add Credential" entity="vault" />
            </div>
          </div>
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-white px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3.5 py-2.5 shadow-sm transition-shadow hover:border-primary-200 hover:ring-1 hover:ring-primary-200"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <img
                        src={
                          basePath +
                          (getVaultAppIcon(String(row.getValue("type"))) ??
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
                              className="h-3.5 w-3.5 text-green-600"
                              aria-label="OAuth connected"
                            />
                          </Tooltip>
                        )}

                        {row.original.corsairStatus === "Failed" && (
                          <Tooltip
                            content={row.original.corsairStatusReason ?? "Connection failed"}
                          >
                            <AlertCircleIcon
                              className="h-3.5 w-3.5 text-red-600"
                              aria-label="Connection failed"
                            />
                          </Tooltip>
                        )}

                        {row.original.corsairStatus === "Expired" && (
                          <Tooltip content="Connection expired; reconnect required">
                            <AlertCircleIcon
                              className="h-3.5 w-3.5 text-red-600"
                              aria-label="Connection expired"
                            />
                          </Tooltip>
                        )}

                        {row.original.corsairStatus === "Pending" && (
                          <Tooltip content="Connection pending">
                            <Clock3Icon
                              className="h-3.5 w-3.5 text-amber-600"
                              aria-label="Connection pending"
                            />
                          </Tooltip>
                        )}

                        <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem]  flex items-center justify-center  text-primary  rounded-full">
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

                  <VaultRowActions
                    rowId={row.original.id || "rowId"}
                    accessLevel={row.original.accessLevel}
                    name={row.original.name}
                    type={row.original.type}
                    isTenantWideAccess={row.original.isTenantWideAccess || false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-2.5 py-3">
              <p className="text-sm text-muted-foreground">
                No credentials found. Please add new credentials.
              </p>
            </div>
          )}
          <DTPagination table={table} singularLabel="credential" pluralLabel="credentials" />

          <ResourceShareDialog queryKey={queryKey} />

          <VaultsBulkActions table={table} />
        </div>
      ) : (
        <VaultTableSkeleton />
      )}
    </>
  );
};
