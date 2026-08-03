import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import {
  VectorStoreQueryRequestDto,
  VectorStoreQueryResponseDto,
  queryVectorStore,
} from "@/features/dynamic-config-panel/apis/vector-store-apis";

export function useRetrieveChunksMutation() {
  return useMutation<VectorStoreQueryResponseDto, Error, VectorStoreQueryRequestDto>({
    mutationFn: async (payload: VectorStoreQueryRequestDto) => {
      return await queryVectorStore(payload);
    },

    onError: (error) => {
      console.error(error);

      toast.error(error?.message || "Failed to retrieve chunks");
    },
  });
}
