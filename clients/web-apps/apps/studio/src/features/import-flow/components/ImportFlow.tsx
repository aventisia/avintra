import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@avplatform/ui";
import { useImportStore } from "../stores/import-flow-store";
import { useFileUpload } from "../hooks/useFileUpload";
import { useFlowMutation } from "../hooks/useUpdateFlowMutation";
import { SUPPORTED_FILE_TYPES } from "../constants";
import { ImportConfirmationDialog } from "./ImportConfirmationDialog";
import { useShallow } from "zustand/react/shallow";
import { toast } from "@avplatform/ui/sonner";

/**
 * Main component that allows users to import a flow.
 * Handles file upload, flow update mutation, and the confirmation dialog.
 */
const ImportFlow = () => {
  // Extract search parameters from the URL to get flowId and versionId
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get("f") || "";
  const versionId = searchParams.get("v") || undefined;

  // Import state management
  const { upload, showDialog, setShowDialog } = useImportStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      upload: state.upload,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Reference for the file input field
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook to handle file upload logic and data parsing
  const { uploadedData, handleFileUpload, setUploadedData } = useFileUpload();

  // Hook for handling the flow update mutation logic
  const { updateFlow, isImportPending, setImportPending } = useFlowMutation(
    flowId,
    versionId,
    setUploadedData,
  );

  // Trigger file input click when the `upload` state changes
  useEffect(() => {
    if (upload) fileInputRef.current?.click();
  }, [upload]);

  // Handle the flow update on dialog confirmation
  const handleUpdate = () => {
    setImportPending(true);

    try {
      const parsedData = JSON.parse(uploadedData);
      const { reactFlowObject, flowVariablesObject } = parsedData;

      // Update flow with the correct structure
      updateFlow({
        id: flowId,
        reactFlowObject: JSON.stringify(reactFlowObject),
        flowVariablesObject: JSON.stringify(flowVariablesObject),
        versionId,
      });
    } catch {
      toast.error("Error processing the imported file");
    }
  };

  return (
    <div>
      {/* File input field that triggers file selection */}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept={SUPPORTED_FILE_TYPES.join(",")}
      />

      {/* Dialog to confirm flow import */}
      <ImportConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        isPending={isImportPending}
        onConfirm={handleUpdate}
      />
    </div>
  );
};

export default ImportFlow;
