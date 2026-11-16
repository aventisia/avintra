import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";

import { useSaveAsTemplateStore } from "../stores/save-as-template-store";
import { SaveAsTemplateCard } from "./SaveAsTemplateCard";

/**
 * Opens the Save as template card while the store says so. The card mounts only while open,
 * so its form state and template lookup start fresh each time.
 */
export const SaveAsTemplateDialog = () => {
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
    if (!showDialog) clearAll();
  }, [clearAll, showDialog]);

  if (!showDialog) return null;

  return <SaveAsTemplateCard onClose={() => setShowDialog(false)} />;
};
