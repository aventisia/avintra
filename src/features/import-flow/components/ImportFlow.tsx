// import { updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";
// import { useCurrentFlowStore } from "@/stores/current-flow-store";
// import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
// import { Input, LoadingSpinner } from "@aventisia/ui";
// import { toast } from "@aventisia/ui/sonner";
// import {
//   useIsFetching,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query";
// import React, { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useShallow } from "zustand/react/shallow";
// import { useImportStore } from "../stores/inputs-outputs-store";
// import { deepParse } from "@/features/react-flow/utils/deepParse";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@aventisia/ui/alert-dialog";

// const ImportFlow = () => {
//   const [searchParams] = useSearchParams();

//   const flowId = searchParams.get("f");
//   const versionId = searchParams.get("v") || undefined;

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const { upload, showDialog, setShowDialog, setUpload } = useImportStore(
//     useShallow((state) => ({
//       showDialog: state.showDialog,
//       upload: state.upload,
//       setShowDialog: state.setShowDialog,
//       setUpload: state.setUpload,
//     })),
//   );

//   useEffect(() => {
//     if (upload) fileInputRef.current?.click();
//   }, [upload]);

//   const queryClient = useQueryClient();

//   // Get global store state & actions
//   const { setIsFlowSaving } = useCurrentFlowStore(
//     useShallow((state) => ({
//       setIsFlowSaving: state.setIsFlowSaving,
//     })),
//   );

//   // Get ReactFlowExt store state & actions
//   const { setIsSavePending } = useReactFlowExtStore(
//     useShallow((state) => ({
//       setIsSavePending: state.setIsSavePending,
//     })),
//   );

//   const [uploadedData, setUploadedData] = useState<string>("");

//   // Create a mutation to update flow silently
//   const { mutate: updateFlow, isPending } = useMutation({
//     mutationFn: updateFlowSilently,
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["flow", flowId, versionId],
//       });

//       // Set isSavePending to false
//       setIsSavePending(false);
//     },
//     onError: (error) => {
//       // Show error toast
//       toast.error(error.toString());
//     },
//     onSettled: () => {
//       // Set isFlowSaving to false
//       setIsFlowSaving(false);
//     },
//   });

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setUpload(false);
//     event.preventDefault();
//     const file = event.target.files?.[0];

//     if (!file) return;

//     const isJson =
//       file.type === "application/json" || file.name.endsWith(".json");

//     if (!isJson) {
//       console.error("Unsupported file type");
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = (e) => {
//       try {
//         const content = e.target?.result as string;
//         const parsed = deepParse(content) || {};
//         const validated = ["nodes", "edges", "viewport"].every((key) =>
//           Object.prototype.hasOwnProperty.call(parsed, key),
//         );
//         if (!validated) {
//           toast.error("Please upload valid data");
//         }
//         if (isJson && validated) {
//           setUploadedData(content);
//           setShowDialog(true);
//         }
//       } catch (err) {
//         toast.error("Please upload valid data");
//       } finally {
//         setUpload(false);
//       }
//     };

//     reader.onerror = () => {
//       console.error("File reading error");
//     };

//     reader.readAsText(file);
//   };

//   const isFetchingAgent = useIsFetching({
//     queryKey: ["flow", flowId, versionId],
//   });

//   useEffect(() => {
//     if (!isFetchingAgent && !isPending) setShowDialog(false);
//   }, [isFetchingAgent, isPending, setShowDialog]);
//   const handleUpdate = () => {
//     updateFlow({
//       id: flowId || "",
//       reactFlowObject: uploadedData,
//       versionId: versionId,
//     });
//   };
//   return (
//     <div>
//       <Input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileUpload}
//         className="hidden"
//         accept=".json,application/json"
//       />
//       <AlertDialog
//         open={showDialog}
//         onOpenChange={() => {
//           setShowDialog(!showDialog);
//         }}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Import Agent</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will overwrite your current flow with the imported data. Are
//               you sure you want to proceed?
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               disabled={!!isFetchingAgent || isPending}
//               onClick={() => handleUpdate()}
//             >
//               {!!isFetchingAgent || isPending ? (
//                 <>
//                   <LoadingSpinner className="mr-1 h-3 w-3 text-muted-foreground" />
//                   Importing
//                 </>
//               ) : (
//                 "Import"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ImportFlow;

// src/components/ImportFlow.tsx

// src/components/ImportFlow.tsx

import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@aventisia/ui";
import { useImportStore } from "../stores/import-flow-store";
import { useFileUpload } from "../hooks/useFileUpload";
import { useFlowMutation } from "../hooks/useUpdateFlowMutation";
import { SUPPORTED_FILE_TYPES } from "../constants";
import { ImportConfirmationDialog } from "./ImportConfirmationDialog";
import { useShallow } from "zustand/react/shallow";

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
  const { uploadedData, handleFileUpload } = useFileUpload();

  // Hook for handling the flow update mutation logic
  const { updateFlow, isImportPending, setImportPending } = useFlowMutation(
    flowId,
    versionId,
  );

  // Trigger file input click when the `upload` state changes
  useEffect(() => {
    if (upload) fileInputRef.current?.click();
  }, [upload]);

  // Handle the flow update on dialog confirmation
  const handleUpdate = () => {
    setImportPending(true);
    updateFlow({
      id: flowId,
      reactFlowObject: uploadedData,
      versionId,
    });
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
