import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog"
import { ScrollArea } from "@/react-toolkit/ui/scroll-area"
import { QueueUploadItemsDialogWrapper } from "./QueueUploadItemsDialogWrapper"

export const QueueUploadItemsDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Return dialog
  return (
    <QueueUploadItemsDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader
          heading="Upload Items"
        />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
        </ScrollArea>
      </DialogContent>
    </QueueUploadItemsDialogWrapper>
  );
};
