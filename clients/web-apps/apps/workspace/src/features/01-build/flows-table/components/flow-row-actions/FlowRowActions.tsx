import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { FlowRowActionItems, FlowRowActionsProps } from "./FlowRowActionItems";

/**
 * Actions menu of an agent card in the grid view; the table uses the same items in its actions column.
 */
export const FlowRowActions = (props: FlowRowActionsProps) => (
  <TableCNRowActionsMenu
    ariaLabel={`Open actions for ${props.name}`}
    contentClassName="w-44 min-w-44"
  >
    <FlowRowActionItems {...props} />
  </TableCNRowActionsMenu>
);
