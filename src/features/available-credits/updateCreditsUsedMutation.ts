import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { AC_QUERY_KEY } from "./available-credits-constants";

export const useUpdateCreditsUsedMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  // TODO: Mutate credits/units used after successful extraction. For now we are making an api call due to database split but later we should update it from the backend itself
  const { mutate: updateCreditsUsed, isPending } = useMutation({
    mutationFn: (postObj: unknown) => {
      return axiosInstance.post(
        `${import.meta.env.VITE_ACCOUNTS_API_URL}/credit-usage`,
        postObj,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    updateCreditsUsed,
  };
};
