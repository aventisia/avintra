import { Separator } from "@aventisia/ui";
import { DTBulkActions } from "@aventisia/ui/data-table";
import { DTBulkDeleteAction } from "@aventisia/ui/data-table";
import { DTSelectionInfo } from "@aventisia/ui/data-table";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { Table } from "@tanstack/react-table";

import { vaultOptimisticMutationFn } from "../../apis/vaults-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { VaultsTableDto } from "../../dtos/vaults-table-dto";

interface VaultsBulkActionsProps {
  table: Table<VaultsTableDto>;
}

export function VaultsBulkActions({ table }: Readonly<VaultsBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the config
  const { mutate: deleteConfigs } = useListOptimisticMutation<
    string[],
    VaultsTableDto | boolean,
    VaultsTableDto
  >(selectedRowIds, vaultOptimisticMutationFn, DATA_QUERY_KEY);

  // TODO: Rollback selection if there is an error

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            onClick={() => {
              // Show alert dialog to confirm delete
              showDefaultAlertDialog({
                confirmActionFn: () => {
                  // Delete selected configs
                  deleteConfigs({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "configs" : "config"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
