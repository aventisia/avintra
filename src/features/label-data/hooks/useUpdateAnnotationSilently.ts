import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { DEBOUNCE_SAVE_DELAY } from "../constants";
import { useAnnotationDataStore } from "../stores/annotation-data-store";
import { updateAnnotationData } from "../apis/annotation-apis";
import { usePdfListStore } from "@/features/pdf-previewer/stores/pdf-list-store";
import { AnnotationDataDto } from "../dtos/annotation-data-dtos";
import { useFetchAnnotationData } from "./useFetchAnnotationData";

export const useUpdateAnnotationSilently = () => {
  // Get current annotation object and set annotation object
  const { currAnnotationObj, isSavePending, setIsSavePending } =
    useAnnotationDataStore(
      useShallow((state) => ({
        currAnnotationObj: state.currAnnotationObj,
        setAnnotationObject: state.setAnnotationObject,
        isSavePending: state.isSavePending,
        setIsSavePending: state.setIsSavePending,
      })),
    );
  const { selectedPdf } = usePdfListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedPdf,
    })),
  );

  const { data: annotationData ,refetch} = useFetchAnnotationData();

  const currAnnotationData = annotationData?.data as
    | AnnotationDataDto[]
    | undefined;
  const currData = currAnnotationData?.find(
    (item) => item.uploadedDocId === selectedPdf?.id,
  );

  // Create a mutation to update flow silently
  const { mutate: updateAnnotationObj } = useMutation({
    mutationFn: updateAnnotationData,
    onSuccess: () => {
      // Set isSavePending to false
      setIsSavePending(false);
      refetch()
    },
    onError: () => {
      setIsSavePending(false);
    },
  });

  // Function to perform save logic
  const saveData = useCallback(
    (data: AnnotationDataDto) => {
      // Save flow silently
      updateAnnotationObj(data);
    },
    [updateAnnotationObj],
  );

  //
  useEffect(() => {
    const handler = setTimeout(() => {
      // Check if save is pending
      if (!isSavePending) return;
      console.log("saving annotation");
      // Save flow data
      saveData({
        id: currData?.id,
        uploadedDocId: selectedPdf?.id || "",
        mlModelId: selectedPdf?.mlModelId,
        annotationObject: currAnnotationObj,
      });
    }, DEBOUNCE_SAVE_DELAY); // Debounce save operation

    // Cleanup function to clear timeout on unmount or state change
    return () => clearTimeout(handler);
  }, [
    currAnnotationObj,
    currData?.id,
    isSavePending,
    saveData,
    selectedPdf?.id,
    selectedPdf?.mlModelId,
  ]);
};
