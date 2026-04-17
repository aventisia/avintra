import { DTRowAction, DataTableRowActions } from "@aventisia/ui/data-table";
import {
  DropdownMenuSeparator,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { KBRowDeleteAction } from "./KBRowDeleteAction";

interface KBRowActionsProps {
  rowId: string;
}

export const KBRowActions = ({ rowId }: KBRowActionsProps) => {
  const navigate = useNavigate();

  return (
    // Dropdown menu for config table row action */}
    <DataTableRowActions>
      <SimpleDDMenuItem
        Icon={ArrowTopRightOnSquareIcon}
        onClick={() => {
          navigate(rowId);
        }}
        content="Open"
      />

      {/* Edit KB details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Config delete alert dialog  */}
      <KBRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
