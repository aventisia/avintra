import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { FlowBlockCrudForm } from "./FlowBlockCrudForm";

/**
 * Renders the crud dialog for creating or updating a flow block.
 *
 * @returns The JSX element representing the crud dialog.
 */
export const FlowBlockCrudDialog = () => {
  // Get crud dialog store to show dialog state
  const {
    crudDialogOptions: { showDialog },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Return dialog
  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open: boolean) => {
        setShowDialog(open);
      }}
    >
      <DialogContent side={"right"} className="!max-w-[40rem]">
        <DialogDefaultHeader heading="Configure block" />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <FlowBlockCrudForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
