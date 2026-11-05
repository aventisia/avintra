import { Separator } from "@avplatform/ui";
import { DTBulkActions, DTBulkDeleteAction, DTSelectionInfo } from "@avplatform/ui/data-table";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { Table } from "@tanstack/react-table";

import { uiBuilderOptimisticMutationFn } from "../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../constants";
import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";

interface UiBuilderBulkActionsProps {
  table: Table<UiBuilderTableDto>;
}

export function UiBuilderBulkActions({ table }: UiBuilderBulkActionsProps) {
  const { showDefaultAlertDialog } = useShowAlertHandler();

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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <DTBulkDeleteAction
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
          />
        </DTBulkActions>
      )}
    </>
  );
}
