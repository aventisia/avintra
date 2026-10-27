import { buttonVariants } from "@avplatform/ui/buttons";
import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

interface MachineFlowVersionRowActionsProps extends React.PropsWithChildren {
  machineId: string;
  machineName: string;
  flowId: string;
  flowVersionId: string;
  flowVersionLabel: string;
  /** The agent's supported platform, forwarded to the create-job form prefill. */
  flowVersionPlatform?: string;
  className?: string;
}

/**
 * Renders a dropdown menu with actions for a machine flow version row.
 * For example, it can include actions like "Execute" (create job) for the flow version.
 * and a "View" action to view the flow version in the agent builder.
 */
export const MachineFlowVersionRowActions: React.FC<MachineFlowVersionRowActionsProps> = ({
  machineId,
  machineName,
  flowId,
  flowVersionId,
  flowVersionLabel,
  flowVersionPlatform,
  className,
}) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  // Handle view flow version in agent builder action (open in new tab)
  const handleViewFlowVersionAction = () => {
    window.open(
      `${import.meta.env.VITE_STUDIO_PATH}agent?f=${flowId}&v=${flowVersionId}`,
      "_blank",
    );
  };

  // Open the create job form pre-filled with this machine and flow version.
  const handleExecuteFlowVersionAction = () => {
    const backParams = new URLSearchParams();
    backParams.set("e", "machine");
    backParams.set("rid", machineId);
    backParams.set("ca", "view");

    openCrudDialog({
      entity: "job",
      crudAction: "create",
      rowId: window.crypto.randomUUID(),
      back: backParams.toString(),
      extraParams: {
        mid: `${machineId}||${machineName}`,
        fv: `${flowVersionId}||${flowVersionLabel}`,
        ...(flowVersionPlatform ? { fvp: flowVersionPlatform } : {}),
      },
    });
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
          <PlayIcon className="size-4 text-ok" />
          Execute
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
