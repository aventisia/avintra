import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent } from "@avplatform/ui/dialog";
import { useShallow } from "zustand/react/shallow";

import { useUpdatePublishedUi } from "../../hooks/useUpdatePublishedUi.hook";
import { usePublishedUiStore } from "../../stores/published-ui-store";

const UiBuilderDisableDialog = () => {
  const { open, close, uiBuilderProjectId, projectName, willEnable } = usePublishedUiStore(
    useShallow((state) => ({
      open: state.disableDialogOpen,
      close: state.closeDisableDialog,
      uiBuilderProjectId: state.uiBuilderProjectId,
      projectName: state.projectName,
      willEnable: state.willEnable,
    })),
  );

  const { isPending, mutate } = useUpdatePublishedUi();

  const handleConfirm = () => {
    if (uiBuilderProjectId) {
      mutate({ id: uiBuilderProjectId, isDisabled: !willEnable }, { onSettled: close });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue: boolean) => {
        if (!openValue) close();
      }}
    >
      <DialogContent className="space-y-6 p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {willEnable ? "Enable" : "Disable"} {projectName}?
          </h2>
          <p className="text-sm text-muted-foreground">
            {willEnable
              ? "It will reappear in Published and assigned users will regain access."
              : "It will be hidden from Published and assigned users will lose access. Assignments are kept and restored on Enable."}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={willEnable ? "default" : "destructive"}
            disabled={isPending || !uiBuilderProjectId}
            onClick={handleConfirm}
          >
            {isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
            {willEnable ? "Enable" : "Disable"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UiBuilderDisableDialog;
