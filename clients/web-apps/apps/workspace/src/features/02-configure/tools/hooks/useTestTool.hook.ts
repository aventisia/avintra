import { useMutation } from "@tanstack/react-query";

import { testTool } from "../apis/tools.apis";

/**
 * Hook for testing a tool operation in the playground.
 */
export const useTestTool = () => {
  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof testTool>[1] }) => testTool(id, dto),
  });

  return {
    test: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  };
};
