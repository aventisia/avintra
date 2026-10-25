import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pluralize } from "@/utils/pluralize.util";

import { updateFlowFolder } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY, FOLDERS_QUERY_KEY } from "../constants";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useCurrentSpaceId } from "./useCurrentSpaceId.hook";

type MoveTargetFolder = { id: string; name: string } | null;

type MoveFlowVariables = {
  flowId: string;
  flowName: string;
  /** Target folder, or null for the top level. */
  folder: MoveTargetFolder;
};

type MoveFlowsVariables = {
  flows: { id: string; name: string }[];
  /** Target folder, or null for the top level. */
  folder: MoveTargetFolder;
};

type FlowsQueryData = { data?: FlowsTableDto[] };

const getMovedLabel = (flows: MoveFlowsVariables["flows"]) =>
  flows.length === 1 ? flows[0].name : `${flows.length} ${pluralize(flows.length, "agent")}`;

/**
 * Moves agents into a folder or to the top level, updating both agent lists optimistically.
 * The picker, drag and drop, Remove from folder, and the bulk action bar all use this hook.
 */
export const useMoveFlowToFolder = () => {
  const queryClient = useQueryClient();
  const space = useCurrentSpaceId();

  const flowsQueryKeys = [
    [...FLOWS_QUERY_KEY, space],
    [...FLOWS_QUERY_KEY, "SHARED", space],
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ flows, folder }: MoveFlowsVariables) => {
      const results = await Promise.allSettled(
        flows.map((flow) => updateFlowFolder({ flowId: flow.id, folderId: folder?.id ?? null })),
      );
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length === flows.length) throw failures[0].reason;
      return { failedCount: failures.length };
    },
    onMutate: async ({ flows, folder }) => {
      await queryClient.cancelQueries({ queryKey: FLOWS_QUERY_KEY });

      const movedIds = new Set(flows.map((flow) => flow.id));
      const previousData = flowsQueryKeys.map(
        (queryKey) => [queryKey, queryClient.getQueryData<FlowsQueryData>(queryKey)] as const,
      );

      flowsQueryKeys.forEach((queryKey) => {
        queryClient.setQueryData<FlowsQueryData>(queryKey, (old) =>
          old?.data
            ? {
                ...old,
                data: old.data.map((flow) =>
                  flow.id && movedIds.has(flow.id)
                    ? { ...flow, folderId: folder?.id ?? null }
                    : flow,
                ),
              }
            : old,
        );
      });

      return { previousData };
    },
    onError: (error, _variables, context) => {
      toast.error(getMutationErrorMessage(error));

      context?.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSuccess: ({ failedCount }, { flows, folder }) => {
      const folderName = folder?.name ?? "Agents";
      if (failedCount > 0) {
        const movedCount = flows.length - failedCount;
        toast.warning(
          `Moved ${movedCount} of ${flows.length} agents to ${folderName}; ${failedCount} could not be moved`,
        );
        return;
      }
      toast.success(`Moved ${getMovedLabel(flows)} to ${folderName}`, {
        className: "sonner-toaster-sm",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
    },
  });

  const moveFlow = ({ flowId, flowName, folder }: MoveFlowVariables) =>
    mutate({ flows: [{ id: flowId, name: flowName }], folder });

  return { moveFlow, moveFlows: mutate, isMoving: isPending };
};
