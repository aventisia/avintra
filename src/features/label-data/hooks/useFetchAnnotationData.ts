import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
// import { toast } from "sonner";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { getAnnotationList } from "../apis/annotation-apis";
import { useAnnotationDataStore } from "../stores/annotation-data-store";
import { useFileListStore } from "@/features/multi-format-viewer/store/pdf-list-store";
/**
 * Custom hook to fetch data fields using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchAnnotationData = () => {
  // Get model data store state and actions
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  // Get model data store state and actions
  const { setAnnotationObject } = useAnnotationDataStore(
    useShallow((state) => ({
      setAnnotationObject: state.setAnnotationObject,
    })),
  );
  const { selectedPdf } = useFileListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedFile,
    })),
  );
  // Get models using react query
  const { data, isFetching, isLoading, 
    // isError, error, 
    refetch } = useQuery({
    queryKey: ["annotation", modelId],
    queryFn: () => getAnnotationList(modelId),
  });

  useEffect(() => {
    const currObj =
      data?.data.find((item) => item.uploadedDocId == selectedPdf?.id)
        ?.annotationObject || "";
    setAnnotationObject(currObj);
  }, [data, selectedPdf?.id, setAnnotationObject]);
  // Show toast on fetch error
  // useEffect(() => {
  //   if (isError) toast.error(error.toString());
  // }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
