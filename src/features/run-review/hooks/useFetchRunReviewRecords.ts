import { ModelNamesEnum } from "@/components/enums/model-name-enum";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { getRunReviewRecords } from "@/features/run-review/apis/run-review-table-apis";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { RUN_REIVEW_TABLE_QUERY_KEY } from "../constants";

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

  const { data: modelData, isLoading: isModelLoading } =
    useFetchProjectMetaData();

  // Enable query only when modelData has loaded and both modelId and modelData are available
  const isQueryEnabled =
    !isModelLoading &&
    !!modelId &&
    !!modelData?.data?.type &&
    ModelNamesEnum[
      modelData.data.type.toLowerCase() as keyof typeof ModelNamesEnum
    ] !== undefined;

  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: RUN_REIVEW_TABLE_QUERY_KEY,
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
