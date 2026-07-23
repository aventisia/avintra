import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { AgentOptimisticMutationFn } from "../../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../../constants/index";
import type { AgentsTableDto } from "../../dtos/agents-table-dto";

interface AgentRowDeleteActionProps {
  rowId: string;
}

export const AgentRowDeleteAction = ({ rowId }: AgentRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the project
  const { mutate: deleteProject } = useListOptimisticMutation<
    string,
    AgentsTableDto | boolean,
    AgentsTableDto
  >([rowId], AgentOptimisticMutationFn, DATA_QUERY_KEY);

  // Return the component
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
          additionalText: "agent",
        });
      }}
    />
  );
};
