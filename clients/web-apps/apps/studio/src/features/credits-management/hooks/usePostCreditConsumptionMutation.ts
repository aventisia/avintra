import { axiosInstance } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { AC_QUERY_KEY } from "@/features/available-credits/available-credits-constants";

import { CreditConsumptionDto } from "../dtos/credit-consumption-dto";

export const usePostCreditConsumptionMutation = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

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
      if (userSession?.deploymentType == "Commercial")
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
