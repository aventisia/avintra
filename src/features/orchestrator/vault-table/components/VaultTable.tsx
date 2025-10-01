import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  // DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { dateFormatter } from "@aventisia/ui/utils";
import { useShallow } from "zustand/react/shallow";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchVaults } from "../hooks/useFetchVaults";
import { useVaultDialogStore } from "../stores/vault-dialog-store";
import { vaultIconMapper } from "../vault-config/constants/app-list";

import { VaultCrudDialog } from "./vault-crud-dialog/VaultCrudDialog";
import { VaultRowActions } from "./vault-row-actions/VaultRowActions";
import { VaultsBulkActions } from "./vault-row-actions/VaultsBulkActions";
import { vaultsTableColumns } from "./VaultsTableColumns";

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

  // Fetch configs data
  const { data } = useFetchVaults();

  // Create a React table for configs data
  const table = useDataTable(
    vaultsTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search..."
              />
              <Separator orientation="vertical" className="mx-2 h-6" />
              <Button
                onClick={() => {
                  setShowDialog(true);
                  setAction("create");
                  setRowId("");
                  setType("");
                }}
              >
                Add Credential
              </Button>{" "}
            </div>
          </div>
          {/* DT with only rows and custom design */}
          <div className="grid grid-cols-2 gap-4">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Left icon with rounded border */}
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-accent p-2">
                    <img
                      src={vaultIconMapper[row.getValue("type") as string]}
                      alt="icon"
                      className="h-12 w-12"
                    />
                  </div>

                  {/* Name, type, description in flex col */}
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      {row.getValue("type")}
                    </span>
                    <span className="text-lg">{row.getValue("name")}</span>

                    <span className="text-sm text-muted-foreground">
                      Created on{dateFormatter(row.getValue("createdOn"))}
                    </span>
                  </div>
                </div>

                {/* Action trigger */}
                <VaultRowActions rowId={row.original.id || "rowId"} />
              </div>
            ))}
          </div>
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <VaultsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <DataTableSkeleton />
      )}
      <VaultCrudDialog />
    </>
  );
};
