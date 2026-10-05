import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { skillOptimisticMutationFn } from "../../apis/skill-registry.apis";
import { SkillTableDto } from "../../dtos/skill-table.dto";
import { useTableTab } from "../../hooks/useTableTab.hook";

interface SkillRowDeleteActionProps {
  rowId: string;
}

export const SkillRowDeleteAction = ({ rowId }: SkillRowDeleteActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Get mutation function to delete the skill
  const { mutate: deleteSkill } = useListOptimisticMutation<
    string,
    SkillTableDto | boolean,
    SkillTableDto
  >([rowId], skillOptimisticMutationFn, queryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteSkill({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete",
          title: "Delete skill?",
          description:
            "Are you sure you want to delete this skill? This may affect any agent that uses it.",
        });
      }}
    />
  );
};
