import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { projectOptimisticMutationFn } from "../../apis/projects-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { ProjectsTableDto } from "../../dtos/projects-table-dto";

interface ProjectRowDeleteActionProps {
  rowId: string;
}

export const ProjectRowDeleteAction = ({
  rowId,
}: ProjectRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultDeleteAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the project
  const { mutate: deleteProject } = useListOptimisticMutation<
    string,
    ProjectsTableDto | boolean,
    ProjectsTableDto
  >(projectOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultDeleteAlertDialog(
          {
            confirmActionFn: () => {
              // Delete the project
              deleteProject({
                id: rowId,
                payload: rowId,
                crudAction: "delete",
              });
            },
          },
          "project",
        );
      }}
    />
  );
};
