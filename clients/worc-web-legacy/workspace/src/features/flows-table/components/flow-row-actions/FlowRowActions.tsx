import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { AccessTypeEnum } from "../../constants/access-type-enum";

import { FlowRowDeleteAction } from "./FlowRowDeleteAction";
import { FlowRowOpenAction } from "./FlowRowOpenAction";
import { FlowRowRemoveAction } from "./FlowRowRemoveAction";

interface FlowRowActionsProps {
  rowId: string;
  accessType: AccessTypeEnum;
}

export const FlowRowActions = ({ rowId, accessType }: FlowRowActionsProps) => {
  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions>
      {/* To open flow in studio */}
      <FlowRowOpenAction rowId={rowId} />

      {/* View the flow details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit flow details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Flow delete/remove alert dialog  */}
      {accessType == "Owner" ? (
        <FlowRowDeleteAction rowId={rowId} />
      ) : (
        <FlowRowRemoveAction rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
