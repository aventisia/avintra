import {
  ProjectsTableDto,
  projectOptimisticMutationFn,
  DATA_QUERY_KEY,
  ProjectOpenRowAction,
} from "@/features/projects-table";
import {
  DropdownMenuSeparator,
} from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import {
  DTDeleteRowAction,
  DTEditRowAction,
  DTViewRowAction,
  DataTableRowActions,
} from "@/react-toolkit/components/data-table";

interface ProjectsTableRowActionsProps {
  /** The ID of the row */
  rowId: string;
}

/**
 * Renders the actions for a table row in the projects table.
 *
 * @param {ProjectsTableRowActionsProps} props - The component props.
 * @returns {JSX.Element} The rendered row actions component for projects table.
 */
export const ProjectsTableRowActions = ({
  rowId,
}: ProjectsTableRowActionsProps) => {
  // Get mutation function to delete the project
  const { mutate: deleteProject } = useListOptimisticMutation<
    string,
    ProjectsTableDto | boolean,
    ProjectsTableDto
  >(projectOptimisticMutationFn, DATA_QUERY_KEY);

  // Return the component
  return (
    // Dropdown menu for project table row action
    <DataTableRowActions>
      {/* To open project in studio */}
      <ProjectOpenRowAction rowId={rowId} />

      {/* Opens crud dialog to view the project details */}
      <DTViewRowAction rowId={rowId} />

      {/* Opens crud dialog to update project details */}
      <DTEditRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Project delete alert dialog  */}
      <DTDeleteRowAction
        rowDeleteMutateFn={() =>
          deleteProject({
            id: rowId,
            payload: rowId,
            crudAction: "delete",
          })
        }
        description="This action cannot be undone. Are you sure you want to delete this project?"
        confirmBtnText="Yes, delete project"
      />
    </DataTableRowActions>
  );
};
