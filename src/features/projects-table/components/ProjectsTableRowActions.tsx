import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTEditRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTViewRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { ProjectDeleteRowAction } from "./ProjectDeleteRowAction";
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
      <ProjectDeleteRowAction projectId={rowId} />
    </DataTableRowActions>
  );
};
