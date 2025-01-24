import { UNPopverContent } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNPopoverContent";
import { UNPopoverTrigger } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNPopoverTrigger";
import { UNSettingsLink } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNSettingsLink";
import { UNSkeleton } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNSkeleton";
import { UN_POPOVER_HEADING } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useFetchUnreadNotifications } from "@/react-toolkit/features/unread-notifications/hooks/useFetchUnreadNotifications";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";
import { cn } from "@/react-toolkit/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover";
import { useShallow } from "zustand/react/shallow";

interface UnreadNotificationsProps {
  /** Additional class name to override popover content container style */
  className?: string;

  /** Additional class name to override notification trigger icon button */
  triggerSize?: "icon7" | "icon8" | "icon9";
}

/**
 * Renders the Unread Notifications in popover
 */
export const UnreadNotifications = ({
  className,
  triggerSize="icon8",
}: UnreadNotificationsProps) => {
  // Get store state and actions
  const { isPopoverOpen, togglePopoverOpen } = useUnreadNotificationsStore(
    useShallow((state) => ({
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Fetch unread notifications
  const { isLoading } = useFetchUnreadNotifications();

  // Return Unread Notifications Popover
  return (
    <Popover open={isPopoverOpen} onOpenChange={togglePopoverOpen}>
      {/* Custom notification popover trigger */}
      <UNPopoverTrigger triggerSize={triggerSize} />
      {/* Popover content */}
      <PopoverContent
        align="end"
        variant={"responsive"}
        className={cn(className)}
      >
        {/* Notification default header */}
        <PopoverDefaultHeader heading={UN_POPOVER_HEADING}>
          <UNSettingsLink />
        </PopoverDefaultHeader>
        {/* Load skeleton or notification list */}
        {isLoading ? <UNSkeleton /> : <UNPopverContent />}
      </PopoverContent>
    </Popover>
  );
};
