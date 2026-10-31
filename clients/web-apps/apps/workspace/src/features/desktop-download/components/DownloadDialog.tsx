import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogClose, DialogContent } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { focusAccountMenuTrigger } from "@/react-toolkit/features/user-account/account-menu-trigger.util";

import { useDownloadDialogStore } from "../stores/download-dialog-store";
import { DownloadDialogContent } from "./DownloadDialogContent";

/**
 * Renders the Desktop Download dialog as a single self-contained component,
 * mirroring the `UnreadNotifications` pattern: a right-hand slide-over panel opened
 * through `useDownloadDialogStore` from the account menu. Loading/error states are
 * handled by `DownloadDialogContent`.
 */
export const DownloadDialog = () => {
  const { isOpen, toggleOpen } = useDownloadDialogStore(
    useShallow((state) => ({ isOpen: state.isOpen, toggleOpen: state.toggleOpen })),
  );

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent
        side={"right"}
        className="!max-w-[46rem] overflow-hidden"
        onCloseAutoFocus={focusAccountMenuTrigger}
      >
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon8"
            className="absolute right-3 top-3 z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
        <ScrollArea className="h-screen overflow-hidden">
          <DownloadDialogContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
