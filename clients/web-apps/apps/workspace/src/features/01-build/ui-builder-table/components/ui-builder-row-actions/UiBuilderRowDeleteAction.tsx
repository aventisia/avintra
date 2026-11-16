import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { uiBuilderOptimisticMutationFn } from "../../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../../constants";
import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";

interface UiBuilderRowDeleteActionProps {
  rowId: string;
}

export const UiBuilderRowDeleteAction = ({ rowId }: UiBuilderRowDeleteActionProps) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate: deleteProject } = useListOptimisticMutation<
    string,
    UiBuilderTableDto | boolean | number,
    UiBuilderTableDto
  >([rowId], uiBuilderOptimisticMutationFn, UI_BUILDER_QUERY_KEY);

  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteProject({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "UI builder project",
        });
      }}
    />
  );
};
