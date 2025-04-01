import { UNBellIcon } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNBellIcon";
import { UN_POPOVER_HEADING } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { useShallow } from "zustand/react/shallow";

interface UNPopoverTriggerProps {
  /** Additional class name to override notification trigger icon button */
  triggerSize?: "icon7" | "icon8" | "icon9";
}

/**
 * Renders a trigger component for the notifications popover.
 * This component displays a bell icon button with a tooltip.
 */
export const UNPopoverTrigger = ({
  triggerSize = "icon8",
}: UNPopoverTriggerProps) => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useUnreadNotificationsStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Return Bell icon button with tooltip
  return (
    <Tooltip content={UN_POPOVER_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: triggerSize }),
          "hover:bg-white/10",
          isPopoverOpen && "hidden bg-white/10 mlg:flex",
        )}
        onClick={() => togglePopoverOpen}
      >
        <UNBellIcon />
      </PopoverTrigger>
    </Tooltip>
  );
};
