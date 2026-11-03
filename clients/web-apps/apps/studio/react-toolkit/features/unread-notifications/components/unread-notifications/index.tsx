import { buttonVariants } from "@avplatform/ui/buttons";
import { Dialog, DialogClose, DialogContent } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { XIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { UNDialogContent } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNDialogContent";
import { UNDialogTrigger } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNDialogTrigger";
import { UNSkeleton } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNSkeleton";
import { useFetchUnreadNotifications } from "@/react-toolkit/features/unread-notifications/hooks/useFetchUnreadNotifications";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

interface UnreadNotificationsProps {
  /** Additional class name to override notification dialog content container style */
  className?: string;

  /** Additional class name to override notification trigger icon button */
  triggerSize?: "icon7" | "icon8" | "icon9";
}

/**
 * Renders the Unread Notifications in dialog
 */
export const UnreadNotifications = ({
  className,
  triggerSize = "icon8",
}: UnreadNotificationsProps) => {
  // Get store state and actions
  const { isOpen, toggleOpen } = useUnreadNotificationsStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      toggleOpen: state.toggleOpen,
    })),
  );

  // Fetch unread notifications
  const { isLoading } = useFetchUnreadNotifications();

  // Return Unread Notifications Dialog
  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      {/* Custom notification Dialog trigger */}
      <UNDialogTrigger triggerSize={triggerSize} />
      {/* Dialog content */}
      <DialogContent side={"right"} className={cn("!max-w-[26rem]", className)}>
        {/* Minimal header with only the close button (no "Notifications" label) */}
        <div className="flex items-center justify-end border-b px-3.5 py-3">
          <Tooltip content={"Close"} shortcut="Esc">
            <DialogClose className={buttonVariants({ variant: "ghost", size: "icon8" })}>
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </Tooltip>
        </div>
        {/* Load skeleton or notification list */}
        {isLoading ? <UNSkeleton /> : <UNDialogContent />}
      </DialogContent>
    </Dialog>
  );
};
