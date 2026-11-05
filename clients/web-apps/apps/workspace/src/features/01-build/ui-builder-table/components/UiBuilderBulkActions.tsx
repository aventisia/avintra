import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { TrashIcon } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

import { uiBuilderOptimisticMutationFn } from "../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../constants";
import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";

interface UiBuilderBulkActionsProps {
  table: Table<UiBuilderTableDto>;
}

export function UiBuilderBulkActions({ table }: UiBuilderBulkActionsProps) {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  const { mutate: deleteProjects } = useListOptimisticMutation<
    string[],
    UiBuilderTableDto | boolean | number,
    UiBuilderTableDto
  >(selectedRowIds, uiBuilderOptimisticMutationFn, UI_BUILDER_QUERY_KEY);

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={TrashIcon}
          tone="destructive"
          disabled={locked}
          onClick={() => {
            showDefaultAlertDialog({
              confirmActionFn: () => {
                deleteProjects({
                  payload: selectedRowIds,
                  crudAction: "delete-multiple",
                });

                table.toggleAllRowsSelected(false);
              },
              alertType: "delete-multiple",
              additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "projects" : "project"}`,
            });
          }}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
