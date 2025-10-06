import { getUploadedFiles as getSetupUploadedFiles } from "@/features/file-uploader-setup/apis/file-upload-apis";
import { getUploadedFiles } from "@/features/file-uploader-viewer/apis/file-upload-apis";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFileListStore } from "../store/file-list-store";

/**
 * Custom hook to fetch data fields using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUploadedFiles = (
  viewerType: "setup" | "viewer" = "viewer",
) => {
  const { selectedFile, setSelectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      setSelectedFile: state.setSelectedFile,
    })),
  );
  // Get modelId (m) and modelName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  let modelId = queryParams.get("pid");

  // Throw error if model id or name are not provided
  if (!modelId) {
    const labelData = localStorage.getItem("label_data") || "{}";
    const labelDataObj = JSON.parse(labelData);
    modelId = labelDataObj?.model_id;
    if (!modelId) {
      throw new Error("Model Id and name are required");
    }
  }

  const {
    step,
    modelId: mid,
    versionId,
  } = useLabelDataStore(
    useShallow((state) => ({
      step: state.step,
      modelId: state.modelId,
      versionId: state.versionId,
    })),
  );

  // Get models using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["UploadedFiles", viewerType, modelId, versionId],
    queryFn: () =>
      viewerType === "viewer"
        ? getUploadedFiles(versionId)
        : getSetupUploadedFiles(modelId),
    refetchOnMount: true,
  });

  useEffect(() => {}, [step]);

  useEffect(() => {
    if (data?.data && (!selectedFile || selectedFile?.mlModelId != modelId))
      setSelectedFile(data?.data[0]);
  }, [data, selectedFile, setSelectedFile, mid, modelId]);

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch, error };
};
