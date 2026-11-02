import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { vaultCredentialOptimisticMutationFn } from "../../apis/vault-credentials.apis";
import { DATA_QUERY_KEY } from "../../constants";
import { VaultCredentialDto } from "../../dtos/vault-credentials.dto";

interface VaultCredentialBulkActionsProps {
  table: Table<VaultCredentialDto>;
}

export function VaultCredentialBulkActions({ table }: Readonly<VaultCredentialBulkActionsProps>) {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  const { mutate: deleteCredentials } = useListOptimisticMutation<
    string[],
    VaultCredentialDto | boolean | number,
    VaultCredentialDto
  >(selectedRowIds, vaultCredentialOptimisticMutationFn, DATA_QUERY_KEY);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={Trash2}
          tone="destructive"
          disabled={locked || selectedRowIds.length === 0}
          onClick={() => {
            showDefaultAlertDialog({
              confirmActionFn: () => {
                deleteCredentials({ payload: selectedRowIds, crudAction: "delete-multiple" });
                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "credentials" : "credential"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
