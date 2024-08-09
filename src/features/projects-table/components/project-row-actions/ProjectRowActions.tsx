import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { ProjectRowDeleteAction } from "./ProjectRowDeleteAction";
import { ProjectRowOpenAction } from "./ProjectRowOpenAction";

interface ProjectRowActionsProps {
  rowId: string;
}

export const ProjectRowActions = ({ rowId }: ProjectRowActionsProps) => {
  return (
    // Dropdown menu for project table row action */}
    <DataTableRowActions>
      {/* To open project */}
      <ProjectRowOpenAction rowId={rowId} />

      {/* View the project details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit project details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Project delete alert dialog  */}
      <ProjectRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
