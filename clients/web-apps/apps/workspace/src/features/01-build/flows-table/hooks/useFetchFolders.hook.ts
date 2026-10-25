import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getFolders } from "../apis/folders-table.apis";
import { FOLDERS_QUERY_KEY } from "../constants";
import { useCurrentSpaceId } from "./useCurrentSpaceId.hook";

/**
 * Fetches the folders of the current space.
 * @returns The folders (empty until loaded), the query status flags, and the folders query key.
 */
export const useFetchFolders = () => {
  const space = useCurrentSpaceId();
  const queryKey = [...FOLDERS_QUERY_KEY, space];

  const { data, isFetching, isLoading, isError, error, isSuccess } = useQuery({
    queryKey,
    queryFn: () => getFolders(),
  });

  useEffect(() => {
    if (isError) toast.error(error?.toString() ?? "Failed to fetch folders");
  }, [error, isError]);

  return {
    folders: data?.data,
    isFetching,
    isLoading,
    isError,
    isSuccess,
    queryKey,
  };
};
