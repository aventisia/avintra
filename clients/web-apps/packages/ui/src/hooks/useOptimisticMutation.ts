import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type IHttpResponse } from "@/ui/dtos";
import { getMutationErrorMessage } from "@/ui/utils";

/**
 * Custom hook for performing an optimistic mutation.
 *
 * @template TData The type of the data to be passed to the mutation function.
 * @template TResponseResult The type of the data returned by the mutation function.
 * @template TQueryData The type of query data.
 *
 * @param {Function} mutationFn The mutation function that takes data of type Data and returns a Promise of type Result.
 * @param {string[]} queryKey The key used to identify the query in the query cache.
 * @param {QueryData} updatedQueryData The updated query data.
 * @param {boolean} showSuccessToast A boolean indicating whether to show a success toast message. Default is true.
 *
 * @returns {Object} An object containing the `mutate`, `isPending`, `isError`, and `isSuccess` properties.
 */
export const useOptimisticMutation = <TData, TResponseResult, TQueryData>(
  mutationFn: (data: TData) => Promise<IHttpResponse<TResponseResult>>,
  queryKey: string[],
  updatedQueryData: TQueryData[] | undefined,
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
      const previousData = queryClient.getQueryData<TQueryData>(queryKey);

      // Optimistically update the data
      queryClient.setQueryData(queryKey, {
        data: updatedQueryData,
      });

      // Return the previous data
      return previousData;
    },
    onError: (error, _vars, context) => {
      // Show error toast using the backend plain-text message when available
      toast.error(getMutationErrorMessage(error));

      // Revert the change if there is an error
      queryClient.setQueryData(queryKey, context);
    },
    onSuccess: (httpResponse) => {
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
