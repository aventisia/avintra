import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";
import { expandAllGroupNodes } from "@/utils/expandAllGroupNodes";

import { getAgentsExecutionLogsById } from "../apis/job-execution-log-apis";
import { useExecutionStore } from "../stores/execution-log-store";
import { NodeExecutionLogType } from "../types/execution-log-types";

export const useReactFlowViewData = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const jobId = searchParams.get("j");
  const flowId = searchParams.get("f");

  const setFlowId = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("f", id);
    setSearchParams(params, { replace: true });
  };

  // Get ReactFlowExt store state & actions
  const {
    setNodes,
    setEdges,
    setFlowVariablesObject,
    setViewport: setViewportState,
    setVersionMeta,
  } = useReactFlowViewStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setFlowVariablesObject: state.setFlowVariablesObject,
      setViewport: state.setViewport,
      setVersionMeta: state.setVersionMeta,
    })),
  );
  const { initLogs } = useExecutionStore();

  // Get react flow hook to set viewport
  const { fitView } = useReactFlow();

  //Get flow
  const { data, isPending, isLoading, isFetching } = useQuery({
    queryKey: ["JOB_EXECUTION_DETAIL", jobId],
    queryFn: () => getAgentsExecutionLogsById(jobId ?? ""),
    enabled: !!jobId,
    refetchOnMount: "always",
    select: (res) => res.data,
  });

  // Clear canvas whenever jobId is absent (list is still loading/auto-selecting)
  // so stale nodes from a previous session are not shown.
  useEffect(() => {
    if (!jobId) {
      setNodes([]);
      setEdges([]);
    }
  }, [jobId]);

  useEffect(() => {
    if (!data) return;
    if (!flowId) {
      setFlowId(data.flowId);
    }

    setVersionMeta({
      name: data.name ?? "",
      versionNumber: data.versionNumber ?? 0,
    });
    // Parse react flow object
    const flow = deepParse(
      data?.reactFlowObject ?? JSON.stringify([]),
    ) as unknown as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    // Parse Flow Variables Object
    const flowVarObjs = JSON.parse(
      data?.flowVariablesObject ?? JSON.stringify([]),
    );

    if (flow) {
      // Set nodes and edges
      const expandedFlow = expandAllGroupNodes(flow?.nodes, flow?.edges);

      setNodes(expandedFlow?.nodes);
      setEdges(expandedFlow?.edges);

      if (data.nodeExecutionLogs) {
        initLogs(
          deepParse(
            data.nodeExecutionLogs,
          ) as unknown as NodeExecutionLogType[],
          expandedFlow?.nodes,
          expandedFlow?.edges,
        );
      }
      setFlowVariablesObject(flowVarObjs || []);
      //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
      setViewportState(flow.viewport);
      // Fit view
      setTimeout(() => {
        fitView({ duration: ZOOM_ANIMATION_DURATION });
      }, ZOOM_ANIMATION_DURATION);
    } else {
      setNodes([]);
      setEdges([]);
      setFlowVariablesObject([]);
    }
  }, [data]);

  return { isPending, isLoading, isFetching };
};
