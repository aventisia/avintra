import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTBulkDeleteAction } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkDeleteAction";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";

import { Table } from "@tanstack/react-table";

import { keystoreOptimisticMutationFn } from "../../apis/keystores-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { KeystoresTableDto } from "../../dtos/keystores-table-dto";

interface KeystoresBulkActionsProps {
  table: Table<KeystoresTableDto>;
}

export function KeystoresBulkActions({
  table,
}: Readonly<KeystoresBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to delete the keystore
  const { mutate: deleteKeystores } = useListOptimisticMutation<
    string[],
    KeystoresTableDto | boolean,
    KeystoresTableDto
  >(selectedRowIds, keystoreOptimisticMutationFn, DATA_QUERY_KEY);

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
                  // Delete selected keystores
                  deleteKeystores({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  // Remove selection
                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "keystores" : "keystore"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
