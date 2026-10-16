import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { UiBuilderRowAssignUsersAction } from "./UiBuilderRowAssignUsersAction";
import { UiBuilderRowDeleteAction } from "./UiBuilderRowDeleteAction";
import { UiBuilderRowDisableAction } from "./UiBuilderRowDisableAction";
import { UiBuilderRowEnableAction } from "./UiBuilderRowEnableAction";
import { UiBuilderRowOpenAction } from "./UiBuilderRowOpenAction";

interface UiBuilderRowActionsProps {
  project: UiBuilderTableDto;
}

export const UiBuilderRowActions = ({ project }: UiBuilderRowActionsProps) => {
  const actions = getResourceAccessActions(project.accessLevel);
  const rowId = project.id || "";

  return (
    <DataTableRowActions className="w-36 min-w-36">
      {/* To open the project in the UI builder */}
      <UiBuilderRowOpenAction rowId={rowId} />

      {/* View the project details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="uiBuilder" />}

      {/* Edit project details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="uiBuilder" />}

      {/* Assign users to the published project */}
      {actions?.update && (
        <UiBuilderRowAssignUsersAction rowId={rowId} isDisabled={!!project.isDisabled} />
      )}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Disable / Enable the project */}
      {actions?.update &&
        (project.isDisabled ? (
          <UiBuilderRowEnableAction project={project} />
        ) : (
          <UiBuilderRowDisableAction rowId={rowId} />
        ))}

      {/* Triggers project delete alert dialog */}
      {actions?.delete && <UiBuilderRowDeleteAction rowId={rowId} />}
    </DataTableRowActions>
  );
};
