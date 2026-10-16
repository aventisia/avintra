import { toast } from "@avplatform/ui/sonner";
import { Edge, Node } from "@xyflow/react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { isChatAgentGraph } from "@/features/react-flow/utils/chat-agent-graph.util";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { isVoiceAgentGraph } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { REQUIRED_JSON_KEYS } from "../constants";
import { useImportStore } from "../stores/import-flow-store";

/**
 * Type definitions for the imported JSON structure
 */
type ReactFlowObject = {
  nodes: unknown[];
  edges: unknown[];
  viewport: unknown;
};

type ImportFileObject = {
  reactFlowObject: ReactFlowObject;
  flowVariablesObject: unknown[];
};

/**
 * Custom hook to handle file upload, validation, and data parsing.
 */
export const useFileUpload = () => {
  // Local state to store the uploaded data as a string
  const [uploadedData, setUploadedData] = useState<string>("");

  // Import state management
  const { setUpload, setShowDialog } = useImportStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      upload: state.upload,
      setShowDialog: state.setShowDialog,
      setUpload: state.setUpload,
    })),
  );

  // Flow type of the canvas receiving the import
  const { isChatAgent, isVoiceAgent } = useCurrentFlowStore(
    useShallow((state) => ({
      isChatAgent: state.isChatAgent,
      isVoiceAgent: state.isVoiceAgent,
    })),
  );

  /**
   * Handles file selection and upload.
   * Validates the file type and content before setting the data and showing the dialog.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpload(false);
    event.preventDefault();
    const file = event.target.files?.[0];

    // Early return if no file is selected
    if (!file) return;

    // Check if the uploaded file is a valid JSON file
    const isJson = file.type === "application/json" || file.name.endsWith(".json");

    // If the file type is invalid, show an error toast
    if (!isJson) {
      toast.error("Unsupported file type");
      return;
    }

    // Create a new FileReader to read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Parse the file content and validate it
        const content = e.target?.result as string;
        const parsed: ImportFileObject = (deepParse(content) as unknown as ImportFileObject) || {};

        // Check for reactFlowObject and validate its keys
        const isValid = REQUIRED_JSON_KEYS.every((key) =>
          Object.prototype.hasOwnProperty.call(parsed.reactFlowObject, key),
        );

        // Validate if flowVariablesObject exists and is an array
        if (!Array.isArray(parsed.flowVariablesObject)) {
          toast.error("Invalid flow variables object (must be an array)");
          return;
        }

        // If the parsed data is not valid, show an error
        if (!isValid) {
          toast.error("Please upload valid data");
          return;
        }

        // Only allow importing a flow whose type matches the flow being edited
        const importedNodes = parsed.reactFlowObject.nodes;
        const importedEdges = parsed.reactFlowObject.edges;

        if (!Array.isArray(importedNodes) || !Array.isArray(importedEdges)) {
          toast.error("Please upload valid data");
          return;
        }

        const importedIsChatAgent = isChatAgentGraph(
          importedNodes as Node[],
          importedEdges as Edge[],
        );
        const importedIsVoiceAgent = isVoiceAgentGraph(
          importedNodes as Node[],
          importedEdges as Edge[],
        );

        if (isChatAgent && !importedIsChatAgent) {
          toast.error("Only Chat Agent flows allowed");
          return;
        }

        if (isVoiceAgent && !importedIsVoiceAgent) {
          toast.error("Only Voice Agent flows allowed");
          return;
        }

        if (!isChatAgent && !isVoiceAgent && (importedIsChatAgent || importedIsVoiceAgent)) {
          toast.error("Chat Agent or Voice Agent flow not allowed here");
          return;
        }

        // If valid, set the uploaded data and show the dialog
        setUploadedData(content);
        setShowDialog(true);
      } catch {
        // Show error if there was an issue parsing the content
        toast.error("Error parsing file content");
      }
    };

    // Show error if there's an issue reading the file
    reader.onerror = () => toast.error("Error reading the file");

    // Start reading the file as text
    reader.readAsText(file);
  };

  return { uploadedData, handleFileUpload, setUploadedData };
};
