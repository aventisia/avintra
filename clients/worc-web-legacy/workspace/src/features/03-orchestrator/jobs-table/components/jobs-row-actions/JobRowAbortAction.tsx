import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { StopIcon } from "@heroicons/react/24/solid";

import { useAbortJobExecutionMutation } from "../../hooks/useAbortJobExecutionMutation";

interface JobRowAbortActionProps {
  rowId: string;
}

export const JobRowAbortAction = ({ rowId }: JobRowAbortActionProps) => {
  const { abortJobMutation } = useAbortJobExecutionMutation();

  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownItem" }), "h-8")}
      onClick={() => abortJobMutation(rowId)}
    >
      <div className="focus::text-red-500/80 flex cursor-pointer items-center gap-1 text-red-500/80">
        <StopIcon className={cn("", "h-4 w-4")} />
        Abort
      </div>
    </DropdownMenuItem>
  );
};
