import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { AddTriggerRowAction } from "./AddTriggerRowAction";
import { AssignAgentsRowAction } from "./AssignAgentsRowAction";
import { AssignUsersRowAction } from "./AssignUsersRowAction";
import { OpenQueueRowAction } from "./OpenQueueRowAction";
import { QueueRowDeleteAction } from "./QueueRowDeleteAction";
import { UploadItemsRowAction } from "./UploadItemsRowAction";

interface QueueRowActionsProps {
  rowId: string;
  queueName: string;
  type: string;
}

export const QueueRowActions = ({
  rowId,
  queueName,
  type,
}: QueueRowActionsProps) => {
  return (
    // Dropdown menu for Queue table row action */}
    <DataTableRowActions className="flex !w-8 flex-col">
      {/* View the Queue details */}
      <OpenQueueRowAction rowId={rowId} />
      {/* Edit Queue details */}
      <DTRowAction rowId={rowId} crudAction="update" />
      {type == "User" ? (
        <AssignUsersRowAction rowId={rowId} queueName={queueName} />
      ) : (
        <AssignAgentsRowAction rowId={rowId} queueName={queueName} />
      )}{" "}
      <AddTriggerRowAction rowId={rowId} />
      <UploadItemsRowAction rowId={rowId} />
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Triggers Queue delete alert dialog  */}
      <QueueRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
