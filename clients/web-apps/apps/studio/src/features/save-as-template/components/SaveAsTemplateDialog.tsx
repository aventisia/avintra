import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";

import { useSaveAsTemplateStore } from "../stores/save-as-template-store";
import { SaveAsTemplateForm } from "./SaveAsTemplateForm";

/**
 * SaveAsTemplateDialog component
 *
 * A modal dialog that allows users to save the current configuration as a template.
 * Uses Zustand for local state management.
 */
export const SaveAsTemplateDialog = () => {
  // Select dialog visibility state and setter function from the store
  const { showDialog, setShowDialog } = useSaveAsTemplateStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );
  const { clearAll } = useFileStore(
    useShallow((state) => ({
      clearAll: state.clearAll,
    })),
  );

  useEffect(() => {
    if (!showDialog) clearAll(); // Dialog is being closed
  }, [clearAll, showDialog]);

  return (
    <Dialog
      open={showDialog}
      onOpenChange={() => {
        setShowDialog(!showDialog);
      }}
    >
      <DialogContent className="!max-w-2xl">
        {/* Header with static title */}
        <DialogDefaultHeader heading="Save as template" />

        {/* Main form to save current config as a template */}
        <SaveAsTemplateForm />
      </DialogContent>
    </Dialog>
  );
};
