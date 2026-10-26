import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { SpacesTableDto } from "../../dtos/spaces-table-dto";
import { SpaceRowDeleteAction } from "./SpaceRowDeleteAction";

interface SpaceRowActionsProps {
  rowId: string;
  row: SpacesTableDto;
}

export const SpaceRowActions = ({ rowId, row }: SpaceRowActionsProps) => {
  // The default "Central" space cannot be edited or deleted.
  const isDefault = row.isDefault;

  return (
    // Dropdown menu for Space table row action
    <DataTableRowActions>
      {/* View the Space details */}
      <DTRowAction rowId={rowId} crudAction="read" entity="space" />

      {/* Edit Space details */}
      <DTRowAction rowId={rowId} crudAction="update" entity="space" disabled={isDefault} />

      {/* Share Space access */}
      <ResourceUserAccessRowAction
        rowId={rowId}
        resourceName={row.name}
        isTenantWideAccess={false}
        resourceType={ResourceTypeEnum.Space}
      />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Space delete alert dialog */}
      <SpaceRowDeleteAction rowId={rowId} row={row} />
    </DataTableRowActions>
  );
};
