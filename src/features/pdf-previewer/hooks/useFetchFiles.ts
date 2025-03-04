import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getUploadedFiles } from "@/features/file-uploader/apis/file-upload-apis";
import { usePdfListStore } from "../stores/pdf-list-store";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useLocation } from "react-router-dom";
/**
 * Custom hook to fetch data fields using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUploadedFiles = () => {
  const { setSelectedPdf } = usePdfListStore();
  // Get modelId (m) and modelName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  let modelId = queryParams.get("mid");

  // Throw error if model id or name are not provided
  if (!modelId) {
    const labelData = localStorage.getItem("label_data") || "{}";
    const labelDataObj = JSON.parse(labelData);
    modelId = labelDataObj?.model_id;
    if (!modelId) {
      throw new Error("Model Id and name are required");
    }
  }

  const { step } = useLabelDataStore(
    useShallow((state) => ({ step: state.step, modelId: state.modelId })),
  );

  // Get models using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["UploadedFiles", modelId],
    queryFn: () => getUploadedFiles(modelId),
    refetchOnMount: true,
  });

  useEffect(() => {}, [step]);

  useEffect(() => {
    if (data?.data) setSelectedPdf(data?.data[0]);
  }, [data, setSelectedPdf]);

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
