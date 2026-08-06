import { Dialog, DialogContent } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
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
        <ScrollArea className="h-screen overflow-hidden">
          <DownloadDialogContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
