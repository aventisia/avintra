import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

interface MachineFlowVersionRowActionsProps extends React.PropsWithChildren {
  machineId: string;
  flowId: string;
  flowVersionId: string;
  className?: string;
}

/**
 * Renders a dropdown menu with actions for a machine flow version row.
 * For example, it can include actions like "Execute" (create job) for the flow version.
 * and a "View" action to view the flow version in the agent builder.
 */
export const MachineFlowVersionRowActions: React.FC<MachineFlowVersionRowActionsProps> = ({
  machineId,
  flowId,
  flowVersionId,
  className,
}) => {
  // Handle view flow version in agent builder action (open in new tab)
  const handleViewFlowVersionAction = () => {
    window.open(
      `${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}agent?f=${flowId}&v=${flowVersionId}`,
      "_blank",
    );
  };

  // TODO: machine_tables feature refactor. Handle execute/create job action for the flow version
  const handleExecuteFlowVersionAction = () => {
    console.log("Machine Id:", machineId);
    // TODO: machine_tables feature refactor. Implement execute flow version action
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon6" }),
          "data-[state=open]:bg-muted",
        )}
      >
        <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-fit flex flex-col min-w-28", className)}>
        <SimpleDDMenuItem
          content="View"
          Icon={ArrowTopRightOnSquareIcon}
          onClick={() => handleViewFlowVersionAction()}
        />
        <DropdownMenuItem
          className={cn(buttonVariants({ variant: "dropdownItem" }), "h-8")}
          onClick={() => handleExecuteFlowVersionAction()}
        >
          <PlayIcon className="size-4 text-green-500/80" />
          Execute
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
