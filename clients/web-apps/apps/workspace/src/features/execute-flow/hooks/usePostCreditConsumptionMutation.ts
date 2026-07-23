import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { CreditConsumptionDto } from "../dtos/credit-consumption-dto";

export const usePostCreditConsumptionMutation = () => {
  // Get query client
  const queryClient = useQueryClient();

  // TODO: Mutate credits/units used after successful extraction. For now we are making an api call due to database split but later we should update it from the backend itself
  const { mutateAsync: postCreditConsumption, isPending } = useMutation({
    mutationFn: (postObj: CreditConsumptionDto[]) => {
      return axiosInstance.post(
        `${import.meta.env.VITE_ACCOUNTS_API_PATH}/credit-usage/bulk`,
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
    postCreditConsumption,
  };
};
