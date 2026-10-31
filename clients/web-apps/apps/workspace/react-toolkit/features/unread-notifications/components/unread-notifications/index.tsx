import { buttonVariants } from "@avplatform/ui/buttons";
import { Dialog, DialogClose, DialogContent } from "@avplatform/ui/dialog";
import { Tooltip } from "@avplatform/ui/tooltip";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { UNDialogContent } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNDialogContent";
import { UNSkeleton } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNSkeleton";
import { useFetchUnreadNotifications } from "@/react-toolkit/features/unread-notifications/hooks/useFetchUnreadNotifications";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";
import { focusAccountMenuTrigger } from "@/react-toolkit/features/user-account/account-menu-trigger.util";

/**
 * Renders the Unread Notifications in dialog, opened through `useUnreadNotificationsStore`
 */
export const UnreadNotifications = () => {
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
      {/* Dialog content */}
      <DialogContent
        side={"right"}
        className="!max-w-[26rem]"
        onCloseAutoFocus={focusAccountMenuTrigger}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between border-b px-3.5 py-3">
          <h2 className="text-base font-semibold">Notifications</h2>
          <Tooltip content={"Close"} shortcut="Esc">
            <DialogClose className={buttonVariants({ variant: "ghost", size: "icon8" })}>
              <X className="h-5 w-5" />
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
