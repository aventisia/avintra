import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogClose, DialogContent } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDownloadDialogStore } from "../stores/download-dialog-store";
import { DownloadDialogContent } from "./DownloadDialogContent";
import { DownloadDialogTrigger } from "./DownloadDialogTrigger";

interface DownloadDialogProps {
  className?: string;
  triggerSize?: "icon7" | "icon8" | "icon9";
}

/**
 * Renders the Desktop Download dialog as a single self-contained component,
 * mirroring the `UnreadNotifications` pattern: it includes its own header trigger
 * and its own right-hand slide-over panel, and uses `useDownloadDialogStore` for
 * open/close state. Loading/error states are handled by `DownloadDialogContent`.
 */
export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  className,
  triggerSize = "icon8",
}) => {
  const { isOpen, toggleOpen } = useDownloadDialogStore(
    useShallow((state) => ({ isOpen: state.isOpen, toggleOpen: state.toggleOpen })),
  );

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DownloadDialogTrigger triggerSize={triggerSize} />
      <DialogContent side={"right"} className={cn("!max-w-[46rem] overflow-hidden", className)}>
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
