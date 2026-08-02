import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createApiKey } from "../apis/api-key.apis";
import { DATA_QUERY_KEY } from "../constants";
import type { CreateApiKeyReqDto } from "../dtos/create-api-key-req.dto";
import type { CreateApiKeyResDto } from "../dtos/create-api-key-res.dto";

/**
 * Custom hook exposing the API key create mutation.
 * Create cannot use the table-row optimistic hook because the response contains the plaintext key that must be shown once.
 */
export const useApiKeyMutations = () => {
  const queryClient = useQueryClient();

  // Helper to show success toast
  const showSuccess = (message: string | undefined) => {
    if (!message) return;
    toast.success(message, { className: "sonner-toaster-sm" });
  };

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: (httpResponse) => {
      showSuccess(httpResponse?.message);
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error));
    },
  });

  return {
    createApiKey: createApiKeyMutation.mutateAsync,
    isCreatePending: createApiKeyMutation.isPending,
    createApiKeyRes: createApiKeyMutation.data?.data,
  };
};

export type { CreateApiKeyReqDto, CreateApiKeyResDto };
