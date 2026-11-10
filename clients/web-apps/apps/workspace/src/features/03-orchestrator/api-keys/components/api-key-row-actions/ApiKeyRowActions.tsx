import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { ApiKeyRowDeleteAction } from "./ApiKeyRowDeleteAction";

interface ApiKeyRowActionsProps {
  rowId: string;
  isRevoked: boolean;
}

export const ApiKeyRowActions = ({ rowId, isRevoked }: ApiKeyRowActionsProps) => {
  return (
    <TableCNRowActionsMenu ariaLabel="Open api key actions">
      <CrudRowAction rowId={rowId} crudAction="read" entity="apiKey" />
      {!isRevoked && <CrudRowAction rowId={rowId} crudAction="update" entity="apiKey" />}
      <DropdownMenuSeparator />
      <ApiKeyRowDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
