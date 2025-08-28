import InferenceModelTestForm from "@/features/inferencing-model/components/InferenceModelTestForm";
import Nav from "@/features/label-data/components/Header/Nav";
import { useLabelDataQueryKey } from "@/features/label-data/hooks/useLabelDataQueryKey";
import MultiFormatViewer from "@/features/multi-format-viewer/MultiFormatViewer";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";
import { useTabStore } from "@/store/tab-store";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useValidateFidQueryParam } from "../hooks/useValidateFidQueryParams";

export const ViewFile = () => {
  useLabelDataQueryKey();
  const { isValid, isLoading: isFileListLoading } = useValidateFidQueryParam();
  const { data: fileList, refetch, isLoading } = useFetchUploadedFiles();
  const { data: modelData, isLoading: isModelDataLoading } =
    useFetchProjectMetaData();
  const { setActiveTab } = useTabStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedFile } = useFileListStore(
    useShallow((state) => ({
      setSelectedFile: state.setSelectedFile,
      selectedFile: state.selectedFile,
    })),
  );

  useEffect(() => {
    setActiveTab("test");
  }, [setActiveTab]);

  useEffect(() => {
    if (selectedFile?.id) {
      const currentFid = searchParams.get("fid");
      if (currentFid !== selectedFile.id) {
        searchParams.set("fid", selectedFile.id);
        setSearchParams(searchParams);
      }
    }
  }, [selectedFile, searchParams, setSearchParams]);

  if (isLoading || isModelDataLoading || isFileListLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[--icon-color]" />
        <span> Loading...</span>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center gap-3">
        <span> Failed to load Model. Please try again.... </span>
      </div>
    );
  }

  return (
    <>
      <Nav isPdfAvailable={!!fileList?.data.length} refetchList={refetch} />

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70} minSize={35}>
          <MultiFormatViewer />
        </ResizablePanel>
        <ResizableHandle withHandle className="ml-2 mr-0" />
        <ResizablePanel defaultSize={35} minSize={35}>
          <div className="ml-2 rounded-lg bg-white shadow h-full flex flex-col">
            <div className="flex items-center gap-2 h-12 border-b px-4 py-2">
              <p className="text-md font-medium">{modelData?.data.type}</p>
            </div>
            <InferenceModelTestForm />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};
