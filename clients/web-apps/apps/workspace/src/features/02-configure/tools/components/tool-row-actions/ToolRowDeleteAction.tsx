import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { toolOptimisticMutationFn } from "../../apis/tools.apis";
import { ToolDto } from "../../dtos/index";
import { useTableTab } from "../../hooks/useTableTab.hook";

interface ToolRowDeleteActionProps {
  rowId: string;
}

export const ToolRowDeleteAction = ({ rowId }: ToolRowDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { queryKey } = useTableTab();
  const { mutate: deleteToolMutation } = useListOptimisticMutation<
    string,
    ToolDto | boolean,
    ToolDto
  >([rowId], toolOptimisticMutationFn, queryKey);

  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => {
            deleteToolMutation({ payload: rowId, crudAction: "delete" });
          },
          confirmBtnText: "Yes, delete tool",
          title: "Delete tool?",
          description:
            "Are you sure you want to delete this tool? This may break any agent that uses it.",
        });
      }}
    />
  );
};
