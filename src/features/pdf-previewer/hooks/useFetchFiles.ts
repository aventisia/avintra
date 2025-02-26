import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getUploadedFiles } from "@/features/file-uploader/apis/file-upload-apis";
import { usePdfListStore } from "../stores/pdf-list-store";
import { useLocation } from "react-router-dom";
import { useModelDataStore } from "@/features/label-data/stores/model-data-store";
import { useShallow } from "zustand/react/shallow";
/**
 * Custom hook to fetch data fields using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUploadedFiles = () => {
  // Get modelId (m) and modelName (pn)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("m") || "";
  const { setSelectedPdf } = usePdfListStore();
  const { step } = useModelDataStore(
    useShallow((state) => ({ step: state.step })),
  );
  // Get models using react query
  const { data, isFetching, isLoading, isError, error,refetch } = useQuery({
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
  return { data, isFetching, isLoading,refetch };
};
