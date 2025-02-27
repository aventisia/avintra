import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getUploadedFiles } from "@/features/file-uploader/apis/file-upload-apis";
import { usePdfListStore } from "../stores/pdf-list-store";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
/**
 * Custom hook to fetch data fields using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUploadedFiles = () => {
  const { setSelectedPdf } = usePdfListStore();

  const { modelId, step } = useLabelDataStore(
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
