import { DotSeparator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { formatDate } from "@aventisia/ui/utils";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { QueryTabs } from "@/components/QueryTab";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import {
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
} from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { VaultAppsEnum } from "../enums/vault-apps-enum";
import { useFetchVaults } from "../hooks/useFetchVaults";
import { useTableTab } from "../hooks/useTableTab";
import { useVaultDialogStore } from "../stores/vault-dialog-store";
import { vaultAppIconMapper } from "../vault-config/constants/vault-app-icon-mapper";
import { VaultTableSkeleton } from "./VaultTableSkeleton";
import { vaultsTableColumns } from "./VaultsTableColumns";
import { VaultCrudDialog } from "./vault-crud-dialog/VaultCrudDialog";
import { VaultRowActions } from "./vault-row-actions/VaultRowActions";
import { VaultsBulkActions } from "./vault-row-actions/VaultsBulkActions";

/**
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const VaultTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  const { setShowDialog, setAction, setRowId, setType } = useVaultDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
      setType: state.setType,
      setAction: state.setAction,
      setRowId: state.setRowId,
    })),
  );
  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, queryKey, isShared } = useTableTab();

  // Fetch keystores data
  // Use currentTab to dictate which API hook is called
  const { data } = useFetchVaults();

  const vaultsTableColumnsArray = vaultsTableColumns(isShared);

  // Create a React table for configs data
  const table = useDataTable(
    vaultsTableColumnsArray,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["name"]}
                placeholder="Search..."
              />
              {isPersonal && (
                <Button
                  size={"xs"}
                  className="gap-2 text-sm tracking-wide"
                  onClick={() => {
                    setShowDialog(true);
                    setAction("create");
                    setRowId("");
                    setType("");
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Credential
                </Button>
              )}
            </div>
          </div>
          {/* DT with only rows and custom design */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-white px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3.5 py-2.5 shadow-sm transition-shadow hover:border-primary-200 hover:ring-1 hover:ring-primary-200"
                  onClick={() => {
                    setShowDialog(true);
                    setRowId(row.original.id || "");
                    setAction("read");
                  }}
                >
                  {/* Left icon with rounded border */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <img
                        src={
                          basePath +
                          vaultAppIconMapper[
                            VaultAppsEnum[
                              row.getValue("type") as keyof typeof VaultAppsEnum
                            ] as VaultAppsEnum
                          ]
                        }
                        alt="icon"
                        className="size-6"
                      />
                    </div>

                    {/* Name, type, description in flex col */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 ">
                        <div
                          title={row.getValue("name")}
                          className="w-auto truncate text-sm font-medium"
                        >
                          {row.getValue("name")}
                        </div>

                        {isShared && (
                          <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem]  flex items-center justify-center  text-primary  rounded-full">
                            {row.original.accessLevel?.replace(
                              /([A-Z])/g,
                              " $1",
                            )}
                          </span>
                        )}
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

                  {/* Action trigger */}
                  <VaultRowActions
                    rowId={row.original.id || "rowId"}
                    accessLevel={row.original.accessLevel}
                    name={row.original.name}
                    isTenantWideAccess={
                      row.original.isTenantWideAccess || false
                    }
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
          {/* Data table Pagination component */}
          <DTPagination
            table={table}
            singularLabel="credential"
            pluralLabel="credentials"
          />

          {/* Resource Share Dialog component */}
          <ResourceShareDialog queryKey={queryKey} />

          {/* Bulk actions for data table */}
          <VaultsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <VaultTableSkeleton />
      )}
      <VaultCrudDialog />
    </>
  );
};
