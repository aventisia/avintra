import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";

import { useShallow } from "zustand/react/shallow";

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

  return (
    <DialogWrapper
      open={showDialog}
      // Toggles dialog visibility when the dialog is opened or closed
      onOpenChangeFn={() => setShowDialog(!showDialog)}
    >
      <DialogContent className="!max-w-[60vw]" side="right">
        {/* Header with static title */}
        <DialogDefaultHeader heading="Save As Template" />

        {/* Main form to save current config as a template */}
        <SaveAsTemplateForm />
      </DialogContent>
    </DialogWrapper>
  );
};
