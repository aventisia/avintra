import { axiosInstance } from "@avplatform/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { ToolProvider } from "../constants/tools-provider-enum";

type ExecuteToolPayload = {
  agentId: string;
  agentName: string;
  provider: string;
  action: string;
  credentialName: string;
  payload: Record<string, unknown>;
};

type Props = {
  provider: ToolProvider;
};

export function useToolExecutionMutation({ provider }: Props) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector`;

  const mutation = useMutation({
    mutationFn: async (data: ExecuteToolPayload) => {
      abortControllerRef.current = new AbortController();

      const response = await axiosInstance.post(`${baseAPIURL}/${provider}/invoke`, data, {
        signal: abortControllerRef.current.signal,
        headers: getStudioSpaceHeaders(),
      });

      return response.data;
    },

    onError: (error) => {
      console.error("Execution failed:", error);
    },

    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const cancel = () => {
    abortControllerRef.current?.abort();
  };

  return {
    ...mutation,
    cancel,
  };
}
