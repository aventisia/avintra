import AIPersonaModel from "@/features/ai-persona-model/components";
import APIKeysDialog from "@/features/api-keys/components/APIKeysDialog";
import CreateNewCredentialsDialog from "@/features/create-new-credentials/components/CreateNewCredentialsDialog";
import FileUploaderWrapper from "@/features/file-uploader-wrapper/components/FileUploaderWrapper";
import StorageConnectDialog from "@/features/file-uploader-wrapper/components/storage-connect/StorageConnectDialog";
import GenerativeModel from "@/features/generative-model/components";
import InferenceModel from "@/features/inferencing-model/components/InferenceModel";
import InitializeApp from "@/features/initialize-app/components";
import ModelLibraryDialog from "@/features/initialize-app/components/model-library/model-library-dialog/ModelLibraryDialog";
import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";
import PublishModel from "@/features/publish-model/components/PublishModel";
import SaveAsTemplateDialog from "@/features/save-as-template/components/SaveAsTemplateDialog";
import ShareAccessDialog from "@/features/share-access/components";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFetchModel } from "../hooks/useFetchModel";
import { useLabelDataStore } from "../stores/label-data-store";

export const LabelDataContainer = () => {
  useLabelDataQueryKey();

  const { step, setStepState } = useLabelDataStore(
    useShallow((state) => ({
      step: state.step,
      setStepState: state.setStepState,
    })),
  );

  const { data: modelData, isLoading } = useFetchModel();
  const modelTypeFromAPI = modelData?.data.type?.toLowerCase();
  const [searchParams, setSearchParams] = useSearchParams();

  const mlParam = searchParams.get("ml")?.toLowerCase();
  const effectiveModelType = modelTypeFromAPI || mlParam;

  // Update step and query param only when needed
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (modelTypeFromAPI) {
      if (mlParam !== modelTypeFromAPI) {
        newParams.set("ml", modelTypeFromAPI);
        setSearchParams(newParams);
      }
      setStepState(1);
    } else if (mlParam) {
      setStepState(1);
    } else {
      setStepState(0);
      if (newParams.has("ml")) {
        newParams.delete("ml");
        setSearchParams(newParams);
      }
    }
  }, [modelTypeFromAPI, mlParam, setStepState, setSearchParams, searchParams]);

  return (
    <>
      <SaveAsTemplateDialog />
      <APIKeysDialog />
      <PublishModel />
      <StorageConnectDialog />
      <ModelLibraryDialog />
      <CreateNewCredentialsDialog />
      <ShareAccessDialog />

      {isLoading ? (
        <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[--icon-color]" />
          <span>Loading...</span>
        </div>
      ) : step === 0 ? (
        <InitializeApp />
      ) : (
        (() => {
          switch (effectiveModelType) {
            case "conversation":
              return <AIPersonaModel />;
            case "inferencing":
              return (
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={70} minSize={35}>
                    <FileUploaderWrapper />
                  </ResizablePanel>
                  <ResizableHandle withHandle className="ml-2 mr-0" />
                  <ResizablePanel defaultSize={35} minSize={35}>
                    <InferenceModel />
                  </ResizablePanel>
                </ResizablePanelGroup>
              );
            case "generative":
              return <GenerativeModel />;
            default:
              return <InitializeApp />;
          }
        })()
      )}
    </>
  );
};
