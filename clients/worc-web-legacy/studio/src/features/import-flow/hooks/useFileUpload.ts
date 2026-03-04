import { useState } from "react";
import { toast } from "@aventisia/ui/sonner";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { REQUIRED_JSON_KEYS } from "../constants";
import { useImportStore } from "../stores/import-flow-store";
import { useShallow } from "zustand/react/shallow";

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
    const isJson =
      file.type === "application/json" || file.name.endsWith(".json");

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
        const parsed: ImportFileObject =
          (deepParse(content) as unknown as ImportFileObject) || {};

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
