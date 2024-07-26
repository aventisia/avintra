import { DataTableRowActions } from "@/react-toolkit/data-table/components/row-actions/DataTableRowActions";
import { DTDeleteRowAction } from "@/react-toolkit/data-table/components/row-actions/DTDeleteRowAction";
import { DTEditRowAction } from "@/react-toolkit/data-table/components/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/data-table/components/row-actions/DTViewRowAction";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { projectOptimisticMutationFn } from "../apis/projects-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";
import { ProjectsTableDto } from "../dtos/projects-table-dto";
import { ProjectOpenRowAction } from "./ProjectOpenRowAction";


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
