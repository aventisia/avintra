import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { ProhibitIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useDisableUiBuilderStore } from "../../stores/disable-ui-builder-store";

interface UiBuilderRowDisableActionProps {
  rowId: string;
}

export const UiBuilderRowDisableAction = ({ rowId }: UiBuilderRowDisableActionProps) => {
  const { setOpen, setProjectId } = useDisableUiBuilderStore(
    useShallow((state) => ({
      setOpen: state.setShowDialog,
      setProjectId: state.setUiBuilderProjectId,
    })),
  );

  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "h-8")}
      onClick={() => {
        setProjectId(rowId);
        setOpen(true);
      }}
    >
      <ProhibitIcon className={cn("", "h-4 w-4")} />
      Disable
    </DropdownMenuItem>
  );
};
