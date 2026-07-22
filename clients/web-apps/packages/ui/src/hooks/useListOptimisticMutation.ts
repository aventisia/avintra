import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type IHttpResponse, type IOptimisticMutation } from "@/ui/dtos";
import { type OrderByType } from "@/ui/types";
import { getMutationErrorMessage } from "@/ui/utils";

/**
 * Custom hook for performing an optimistic mutation for record list.
 *
 * IMPORTANT NOTE: Create and update operations only works if TPostData and TQueryData types are same
 *
 * @template TPostData The type of the data to be passed to the mutation function.
 * @template TResponseResult The type of the data returned by the mutation function.
 * @template TQueryData The type of query data.
 *
 * @param {string[]} id The id of the record to be mutated. This is used to identify the record or records (in case of delete-multiple) in the query cache.
 * @param {Function} mutationFn The mutation function that takes data of type Data and returns a Promise of type Result.
 * @param {string[]} queryKey The key used to identify the query in the query cache.
 * @param {OrderByType} orderBy The order by which to add the new record. Default is "desc".
 * @param {boolean} showSuccessToast A boolean indicating whether to show a success toast message. Default is true.
 *
 * @returns {Object} An object containing the `mutate`, `isPending`, `isError`, and `isSuccess` properties.
 */
export const useListOptimisticMutation = <
  TPostData,
  TResponseResult,
  TQueryData extends { id?: string },
>(
  id: string[],
  mutationFn: (data: IOptimisticMutation<TPostData>) => Promise<IHttpResponse<TResponseResult>>,
  queryKey: string[],
  orderBy: OrderByType = "desc",
  showSuccessToast: boolean = true,
) => {
  // Get query client
  const queryClient = useQueryClient();

  // Define mutation function to mutate entity
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn,
    onMutate: async (mutateObj) => {
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
      switch (mutateObj.crudAction) {
        case "create":
          updatedQueryData = previousData.data;
          break;
        case "update":
          updatedQueryData = previousData?.data?.map((item) => {
            if (item.id === id[0]) {
              return mutateObj.payload as unknown as TQueryData;
            }
            return item;
          });
          break;
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

      // Optimistically update the data only if not create
      if (mutateObj.crudAction !== "create") {
        queryClient.setQueryData(queryKey, { data: updatedQueryData });
      }

      // Return previous data and the payload for later use
      return { previousData, payload: mutateObj.payload };
    },
    onError: (error, _vars, context) => {
      // Show error toast using the backend plain-text message when available
      toast.error(getMutationErrorMessage(error));

      // Revert the change if there is an error
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSuccess: (httpResponse, _vars, context) => {
      // Add newly created record
      if (_vars.crudAction === "create" && httpResponse?.data) {
        // Merge backend response (id, createdOn) with original payload
        const newRecord = {
          ...(context?.payload as object),
          id: (httpResponse.data as unknown as { id: string }).id,
        } as TQueryData;

        queryClient.setQueryData(queryKey, (old: { data: TQueryData[] }) => {
          if (!old?.data) return { data: [newRecord] };
          return {
            ...old,
            data: orderBy === "desc" ? [newRecord, ...old.data] : [...old.data, newRecord],
          };
        });
      }

      // Return if show success toast is disabled
      if (!showSuccessToast) return;

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
