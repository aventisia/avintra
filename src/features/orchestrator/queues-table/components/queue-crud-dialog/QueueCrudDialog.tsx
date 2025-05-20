import { DTCrudDialogWrapper } from "@aventisia/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { getDialogHeadingDescription } from "../../constants";
import { UploadItemsForm } from "../queue-upload-items/upload-items-form/UploadItemsForm";

import { QueueCrudForm } from "./QueueCrudForm";

export const QueueCrudDialog = ({ children }: React.PropsWithChildren) => {
  // Get crud dialog store state
  const {
    crudDialogOptions: { crudAction },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  // Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  // Return dialog
  return (
    <DTCrudDialogWrapper>
      {children}
      <DialogContent
        side={"right"}
        className={cn(
          crudAction === "delete" ? "!max-w-[60rem]" : "!max-w-[32rem]",
        )}
      >
        <DialogDefaultHeader
          heading={
            crudAction === "delete"
              ? "Upload Items"
              : dialogHeaderOptions.heading
          }
          description={dialogHeaderOptions.description}
        />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          {crudAction === "delete" ? <UploadItemsForm /> : <QueueCrudForm />}
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
