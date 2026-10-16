import { Separator } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { Ban, CheckCircle, Eye, UserIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePublishedUiStore } from "../../stores/published-ui-store";

interface UiBuilderRowActionsProps {
  rowId: string;
  isDisabled: boolean;
  projectName?: string | null;
}

/**
 * Renders the Published row actions for a UI builder project row.
 */
export const UiBuilderRowActions = ({
  rowId,
  isDisabled,
  projectName,
}: UiBuilderRowActionsProps) => {
  const { openUsersDialog, openViewDialog, openDisableDialog } = usePublishedUiStore(
    useShallow((state) => ({
      openUsersDialog: state.openUsersDialog,
      openViewDialog: state.openViewDialog,
      openDisableDialog: state.openDisableDialog,
    })),
  );

  return (
    <>
      <SimpleDDMenuItem
        content="Users"
        Icon={UserIcon}
        disabled={isDisabled}
        onClick={() => openUsersDialog(rowId)}
      />
      <SimpleDDMenuItem content="View" Icon={Eye} onClick={() => openViewDialog(rowId)} />
      <Separator />
      {isDisabled ? (
        <SimpleDDMenuItem
          content="Enable"
          Icon={CheckCircle}
          onClick={() => openDisableDialog(rowId, projectName ?? "", true)}
        />
      ) : (
        <DropdownMenuItem
          className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "h-8")}
          onClick={() => openDisableDialog(rowId, projectName ?? "", false)}
        >
          <Ban className={cn("", "h-4 w-4")} />
          Disable
        </DropdownMenuItem>
      )}
    </>
  );
};
