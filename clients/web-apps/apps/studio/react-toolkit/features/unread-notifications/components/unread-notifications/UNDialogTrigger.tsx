import { buttonVariants } from "@avplatform/ui/buttons";
import { DialogTrigger } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useShallow } from "zustand/react/shallow";

import { UNBellIcon } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNBellIcon";
import { UN_DIALOG_HEADING } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

interface UNDialogTriggerProps {
  /** Additional class name to override notification trigger icon button */
  triggerSize?: "icon7" | "icon8" | "icon9";
}

/**
 * Renders a trigger component for the notifications Dialog.
 * This component displays a bell icon button with a tooltip.
 */
export const UNDialogTrigger = ({
  triggerSize = "icon8",
}: UNDialogTriggerProps) => {
  // Get store state and actions
  const { isOpen, toggleOpen } = useUnreadNotificationsStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      toggleOpen: state.toggleOpen,
    })),
  );

  // Return Bell icon button with tooltip
  return (
    <Tooltip content={UN_DIALOG_HEADING}>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: triggerSize }),
          "hover:bg-white/10",
          isOpen && "hidden bg-white/10 mlg:flex",
        )}
        onClick={() => toggleOpen}
      >
        <UNBellIcon />
      </DialogTrigger>
    </Tooltip>
  );
};
