import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";

import { ApiKeyRowDeleteAction } from "./ApiKeyRowDeleteAction";

interface ApiKeyRowActionsProps {
  rowId: string;
  isRevoked: boolean;
}

export const ApiKeyRowActions = ({ rowId, isRevoked }: ApiKeyRowActionsProps) => {
  return (
    <DataTableRowActions>
      <DTRowAction rowId={rowId} crudAction="read" entity="apiKey" />
      {!isRevoked && <DTRowAction rowId={rowId} crudAction="update" entity="apiKey" />}
      <DropdownMenuSeparator />
      <ApiKeyRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
