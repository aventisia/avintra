import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@aventisia/ui/sonner";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { getRunReviewRecords } from "@/features/run-review/apis/run-review-table-apis";
import { ModelNamesEnum } from "@/features/pdf-previewer/enums/model-name-enum";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";

/**
 * Custom hook to fetch records using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchRunReviewRecords = () => {
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  const { data: modelData, isLoading: isModelLoading } = useFetchModel();

  // Enable query only when modelData has loaded and both modelId and modelData are available
  const isQueryEnabled =
    !isModelLoading &&
    !!modelId &&
    !!modelData?.data?.type &&
    ModelNamesEnum[modelData.data.type as keyof typeof ModelNamesEnum] !== undefined;

  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["runReview"],
    queryFn: () =>
      getRunReviewRecords(
        modelId,
        ModelNamesEnum[modelData!.data.type as keyof typeof ModelNamesEnum],
      ),
    enabled: isQueryEnabled,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(`${error.message || error.toString()}`);
    }
  }, [isError, error]);

  return {
    data,
    refetch,
    isLoading: isLoading || isModelLoading,
    isError,
  };
};
