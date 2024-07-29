import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ProjectsTableDto } from "../dtos/projects-table-dto";
import { projectOptimisticMutationFn } from "../apis/projects-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";

interface DeleteActionProps {
  projectId: string;
}

/**
 * Renders the delete action for a project row item.
 * This component displays a dropdown menu item with a delete button.
 */
export const ProjectDeleteRowAction = ({ projectId }: DeleteActionProps) => {
  // Get showAlert handler
  const { showAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the project
  const { mutate: deleteProject } = useListOptimisticMutation<
    string,
    ProjectsTableDto | boolean,
    ProjectsTableDto
  >(projectOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        showAlertDialog({
          confirmActionFn: () => {
            // Delete the flow
            deleteProject({
              id: projectId,
              payload: projectId,
              crudAction: "delete",
            });
          },
          title: "Delete project",
          description:
            "This action cannot be undone. Are you sure you want to delete this project?",
          confirmBtnText: "Yes, delete project",
        });
      }}
    >
      <TrashIcon className="mb-[2px] h-4 w-4 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
