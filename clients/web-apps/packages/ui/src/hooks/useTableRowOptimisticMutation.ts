import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type IHttpResponse } from "@/ui/dtos";
import { type CrudActionType, type OrderByType } from "@/ui/types";
import { getMutationErrorMessage } from "@/ui/utils";

/**
 * Custom hook for performing an optimistic mutation for data-table row.
 *
 * Create and update cache writes are based on the server response payload,
 * so TPostData can differ from TQueryData.
 *
 * @template TPostData The type of the data to be passed to the mutation function.
 * @template TResponseResult The type of the data returned by the mutation function.
 * @template TQueryData The type of query data/ data-table row.
 *
 * @param {CrudActionType} crudAction The type of CRUD action being performed. It can be "create", "read", "update", "delete", or "delete-multiple".
 * @param {string[]} id The id of the record to be mutated. This is used to identify the record or records (in case of delete-multiple) in the query cache.
 * @param {Function} mutationFn The mutation function that takes data of type Data and returns a Promise of type Result.
 * @param {string[]} queryKey The key used to identify the query in the query cache.
 * @param {OrderByType} orderBy The order by which to add the new record. Default is "desc".
 * @param {boolean} showSuccessToast A boolean indicating whether to show a success toast message. Default is true.
 *
 * @returns {Object} An object containing the `mutate`, `isPending`, `isError`, and `isSuccess` properties.
 */
export const useTableRowOptimisticMutation = <
  TPostData,
  TResponseResult,
  TQueryData extends { id?: string },
>(
  crudAction: CrudActionType,
  id: string[],
  mutationFn: (data: TPostData) => Promise<IHttpResponse<TResponseResult>>,
  queryKey: string[],
  orderBy: OrderByType = "desc",
  showSuccessToast: boolean = true,
) => {
  // Get query client
  const queryClient = useQueryClient();

  // Define mutation function to mutate entity
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn,
    onMutate: async () => {
      // Cancel any refetches
      await queryClient.cancelQueries({
        queryKey,
      });

      // Hold previous data
      const previousData = queryClient.getQueryData<{
        data: TQueryData[];
      }>(queryKey) ?? { data: [] };

      // Get updated query data based on CRUD action
      let updatedQueryData: TQueryData[];
      switch (crudAction) {
        case "delete":
          // Filter out the record that is being deleted
          updatedQueryData = previousData?.data?.filter((item) => item.id !== id[0]);
          break;
        case "delete-multiple":
          // Filter out the multiple records that is being deleted
          updatedQueryData = previousData?.data?.filter(
            (item) => item.id !== undefined && !id.includes(item.id),
          );
          break;
        default:
          updatedQueryData = previousData?.data;
          break;
      }

      // Optimistically update cache only for delete operations.
      if (crudAction === "delete" || crudAction === "delete-multiple") {
        queryClient.setQueryData(queryKey, { data: updatedQueryData });
      }

      // Return previous data for later use
      return { previousData };
    },
    onError: (error, _vars, context) => {
      // Show error toast using the backend plain-text message when available
      toast.error(getMutationErrorMessage(error));

      // Revert the change if there is an error
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSuccess: (httpResponse) => {
      // Add newly created record from server response.
      if (crudAction === "create" && httpResponse?.data) {
        const newRecord = httpResponse.data as unknown as TQueryData;

        queryClient.setQueryData(queryKey, (old: { data: TQueryData[] }) => {
          if (!old?.data) return { data: [newRecord] };
          return {
            ...old,
            data: orderBy === "desc" ? [newRecord, ...old.data] : [...old.data, newRecord],
          };
        });
      }

      // Replace updated record from server response.
      if (crudAction === "update" && httpResponse?.data) {
        const updatedRecord = httpResponse.data as unknown as TQueryData;
        const updatedRecordId =
          updatedRecord.id ?? (httpResponse.data as unknown as { id?: string })?.id ?? id[0];

        queryClient.setQueryData(queryKey, (old: { data: TQueryData[] }) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.map((item) => (item.id === updatedRecordId ? updatedRecord : item)),
          };
        });
      }

      // Return if show success toast is disabled or if there is no message in the server response
      if (!showSuccessToast || !httpResponse?.message) return;

      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },
    onSettled: () => {
      // Refetch the data
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });

  // Return mutation function and pending state
  return { mutate, isPending, isError, isSuccess };
};
