import { Input } from "@avplatform/ui";
import { toast } from "@avplatform/ui/sonner";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { SUPPORTED_FILE_TYPES } from "../constants";
import { useFileUpload } from "../hooks/useFileUpload";
import { useFlowMutation } from "../hooks/useUpdateFlowMutation";
import { useImportStore } from "../stores/import-flow-store";
import { remapImportedFlowIds } from "../utils/remap-imported-flow-ids.util";
import { ImportConfirmationDialog, ImportSummary } from "./ImportConfirmationDialog";

const EMPTY_SUMMARY: ImportSummary = { nodes: 0, connections: 0, variables: 0 };

/** Counts what the uploaded file would bring into the canvas. */
const summarizeUpload = (uploadedData: string): ImportSummary => {
  try {
    const parsed = JSON.parse(uploadedData);
    const canvas = parsed.reactFlowObject ?? {};
    const variables = canvas.flowVariablesObject ?? parsed.flowVariablesObject ?? [];
    return {
      nodes: Array.isArray(canvas.nodes) ? canvas.nodes.length : 0,
      connections: Array.isArray(canvas.edges) ? canvas.edges.length : 0,
      variables: Array.isArray(variables) ? variables.length : 0,
    };
  } catch {
    return EMPTY_SUMMARY;
  }
};

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

  const uploadSummary = useMemo(() => summarizeUpload(uploadedData), [uploadedData]);

  // Trigger file input click when the `upload` state changes
  useEffect(() => {
    if (upload) fileInputRef.current?.click();
  }, [upload]);

  // Handle the flow update on dialog confirmation
  const handleUpdate = () => {
    setImportPending(true);

    try {
      const parsedData = JSON.parse(uploadedData);
      const { reactFlowObject } = parsedData;
      const { flowVariablesObject, inputOutputObject, ...canvas } = reactFlowObject;
      const remappedData = remapImportedFlowIds(
        canvas,
        flowVariablesObject ?? parsedData.flowVariablesObject ?? [],
      );

      // Update flow with the correct structure
      updateFlow({
        id: flowId,
        reactFlowObject: JSON.stringify(remappedData.reactFlowObject),
        flowVariablesObject: JSON.stringify(remappedData.flowVariablesObject),
        ...(Array.isArray(inputOutputObject)
          ? { inputOutputObject: JSON.stringify(inputOutputObject) }
          : {}),
        versionId,
      });
    } catch (error) {
      setImportPending(false);
      toast.error(error instanceof Error ? error.message : "Error processing the imported file");
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
        summary={uploadSummary}
        onConfirm={handleUpdate}
      />
    </div>
  );
};

export default ImportFlow;
