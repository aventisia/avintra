import { Separator } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { Ban, CheckCircle, Eye } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { usePublishedUiStore } from "../../stores/published-ui-store";

interface UiBuilderRowActionsProps {
  rowId: string;
  isDisabled: boolean;
  isTenantWideAccess: boolean;
  projectName?: string | null;
}

/**
 * Renders the Published row actions for a UI builder project row.
 */
export const UiBuilderRowActions = ({
  rowId,
  isDisabled,
  isTenantWideAccess,
  projectName,
}: UiBuilderRowActionsProps) => {
  const { openViewDialog, openDisableDialog } = usePublishedUiStore(
    useShallow((state) => ({
      openViewDialog: state.openViewDialog,
      openDisableDialog: state.openDisableDialog,
    })),
  );

  return (
    <>
      <ResourceUserAccessRowAction
        rowId={rowId}
        resourceName={projectName ?? ""}
        isTenantWideAccess={isTenantWideAccess}
        resourceType={ResourceTypeEnum.UiBuilderPublished}
        disabled={isDisabled}
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
