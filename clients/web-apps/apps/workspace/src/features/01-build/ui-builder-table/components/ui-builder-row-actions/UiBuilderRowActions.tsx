import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { UiBuilderRowDeleteAction } from "./UiBuilderRowDeleteAction";
import { UiBuilderRowOpenAction } from "./UiBuilderRowOpenAction";

interface UiBuilderRowActionsProps {
  rowId: string;
  accessLevel: ResourceAccessTypeEnum;
}

export const UiBuilderRowActions = ({ rowId, accessLevel }: UiBuilderRowActionsProps) => {
  const actions = getResourceAccessActions(accessLevel);

  return (
    <DataTableRowActions className="w-36 min-w-36">
      {/* To open the project in the UI builder */}
      <UiBuilderRowOpenAction rowId={rowId} />

      {/* View the project details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="uiBuilder" />}

      {/* Edit project details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="uiBuilder" />}

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers project delete alert dialog */}
      {actions?.delete && <UiBuilderRowDeleteAction rowId={rowId} />}
    </DataTableRowActions>
  );
};
