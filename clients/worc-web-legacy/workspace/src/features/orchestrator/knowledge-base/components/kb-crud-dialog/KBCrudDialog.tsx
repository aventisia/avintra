import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { getDialogHeadingDescription } from "../../constants";
import { useKBCrudDialogStore } from "../../stores/kb-crud-dialog-store";
import { KBCrudForm } from "./KBCrudForm";

export const KBCrudDialog = () => {
  // Get crud dialog store state
  const { showDialog, action, setShowDialog, setType, setRowId, setAction } =
    useKBCrudDialogStore(
      useShallow((state) => ({
        showDialog: state.showDialog,
        action: state.action,
        setShowDialog: state.setShowDialog,
        setType: state.setType,
        setAction: state.setAction,
        setRowId: state.setRowId,
      })),
    );

  // Return dialog
  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setType("");
          setRowId("");
          setAction("create");
        }
        setShowDialog(open);
      }}
    >
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader {...getDialogHeadingDescription(action)} />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <KBCrudForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
