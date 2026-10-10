import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { vaultCredentialOptimisticMutationFn } from "../../apis/vaults-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { VaultCredentialDto } from "../../dtos/vaults-table-dto";

interface VaultsBulkActionsProps {
  table: Table<VaultCredentialDto>;
}

export function VaultsBulkActions({ table }: Readonly<VaultsBulkActionsProps>) {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  const { mutate: deleteConfigs } = useListOptimisticMutation<
    string[],
    VaultCredentialDto | boolean | number,
    VaultCredentialDto
  >(selectedRowIds, vaultCredentialOptimisticMutationFn, DATA_QUERY_KEY);

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
            onClick={() => {
              showDefaultAlertDialog({
                confirmActionFn: () => {
                  deleteConfigs({
                    payload: selectedRowIds,
                    crudAction: "delete-multiple",
                  });

                  table.toggleAllRowsSelected(false);
                },
                alertType: "delete-multiple",
                additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "credentials" : "credential"}`,
              });
            }}
          />
        </DTBulkActions>
      )}
    </>
  );
}
