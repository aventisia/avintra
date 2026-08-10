import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";

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
      <ResourceShareRowAction
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
