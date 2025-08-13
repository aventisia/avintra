import { Separator } from "@aventisia/ui";
import { buttonVariants } from "@aventisia/ui/buttons";
import { DataTableRowActions } from "@aventisia/ui/data-table";
import {
  DropdownMenuItem,
  // SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { PlayIcon } from "@heroicons/react/24/solid";

import { AgentDisableAction } from "./AgentDisableAction";
import { AssignMachineRowAction } from "./AssignMachineRowAction";
import { EnableAgentRowAction } from "./EnableAgentRowAction";

type TableActionsProps = {
  rowId: string;
  isDisabled: boolean;
  count: number;
};
export const TableActions = ({
  rowId,
  count,
  isDisabled,
}: TableActionsProps) => {
  return (
    <DataTableRowActions>
      <DropdownMenuItem
        disabled={count == 0 || isDisabled}
        className={cn(buttonVariants({ variant: "dropdownItem" }), "h-8")}
      >
        <PlayIcon className={cn("text-green-500/80", "h-4 w-4")} />
        Execute
      </DropdownMenuItem>
      <AssignMachineRowAction rowId={rowId} isDisabled={isDisabled} />
      {/* <SimpleDDMenuItem content="Archive" Icon={ArchiveIcon} /> */}
      <Separator />
      {isDisabled ? (
        <EnableAgentRowAction rowId={rowId} />
      ) : (
        <AgentDisableAction rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
