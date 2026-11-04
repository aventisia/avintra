import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-user-access/utils/resource-access-actions";

import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { UiBuilderRowDeleteAction } from "./UiBuilderRowDeleteAction";
import { UiBuilderRowDisableAction } from "./UiBuilderRowDisableAction";
import { UiBuilderRowEnableAction } from "./UiBuilderRowEnableAction";
import { UiBuilderRowOpenAction } from "./UiBuilderRowOpenAction";

interface UiBuilderRowActionsProps {
  project: UiBuilderTableDto;
}

export const UiBuilderRowActions = ({ project }: UiBuilderRowActionsProps) => {
  const actions = getResourceAccessActions(project.accessLevel);
  const isOwner = project.accessLevel === ResourceAccessTypeEnum.Owner;
  const rowId = project.id || "";

  return (
    <DataTableRowActions className="w-36 min-w-36">
      {/* To open the project in the UI builder */}
      <UiBuilderRowOpenAction rowId={rowId} />

      {/* View the project details */}
      {actions?.read && <DTRowAction rowId={rowId} crudAction="read" entity="uiBuilder" />}

      {/* Edit project details */}
      {isOwner && <DTRowAction rowId={rowId} crudAction="update" entity="uiBuilder" />}

      {/* Share the project with specific people or everyone */}
      <ResourceUserAccessRowAction
        rowId={rowId}
        resourceName={project.name}
        isTenantWideAccess={project.isTenantWideAccess}
        resourceType={ResourceTypeEnum.UiBuilder}
        disabled={!actions?.share}
      />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Disable / Enable the project */}
      {isOwner &&
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
