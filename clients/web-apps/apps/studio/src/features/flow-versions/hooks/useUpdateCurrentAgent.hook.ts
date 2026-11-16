import { IHttpResponse } from "@avplatform/ui/dtos";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { updateFlow } from "@/features/flows-popover/apis/flows-table-apis";
import { LoadFlowDto } from "@/features/react-flow/dtos/load-flow-dto";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

type AgentPatch = { name?: string; description?: string };

export type SaveStatus = "idle" | "saving" | "saved";

const SAVED_FEEDBACK_MS = 2500;

/**
 * Optimistically applies a name or description change to the current agent and persists it.
 * Reports `saving`, then a short-lived `saved`; a failure rolls back only the patched fields.
 */
export const useUpdateCurrentAgent = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const resetTimerRef = useRef<number>();
  const { mutate } = useMutation({ mutationFn: updateFlow });

  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  const save = (patch: AgentPatch) => {
    const { currentFlow: previous, setCurrentFlow } = useCurrentFlowStore.getState();
    const rollback = Object.fromEntries(
      Object.keys(patch).map((key) => [key, previous[key as keyof AgentPatch]]),
    ) as AgentPatch;
    const next = { ...previous, ...patch };

    setCurrentFlow(next);
    window.clearTimeout(resetTimerRef.current);
    setStatus("saving");

    mutate(
      { id: next.id, type: next.type, name: next.name, description: next.description },
      {
        onSuccess: () => {
          // IMPORTANT NOTE: the canvas re-hydrates the current agent from the cached flow
          // whenever that cache changes (a canvas save rewrites it), so the cache must carry
          // the saved fields or a later canvas save restores the old name and description.
          queryClient.setQueriesData<IHttpResponse<LoadFlowDto>>(
            { queryKey: ["flow", next.id] },
            (cached) => (cached?.data ? { ...cached, data: { ...cached.data, ...patch } } : cached),
          );
          setStatus("saved");
          resetTimerRef.current = window.setTimeout(() => setStatus("idle"), SAVED_FEEDBACK_MS);
        },
        onError: (error) => {
          setCurrentFlow({ ...useCurrentFlowStore.getState().currentFlow, ...rollback });
          setStatus("idle");
          toast.error("Couldn't save the agent", { description: error.message });
        },
      },
    );
  };

  return { save, status };
};
