import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { deepParse } from "@/features/react-flow/utils/deepParse";

import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getAgentsExecutionLogsById } from "../apis/job-execution-log-apis";
import { useExecutionStore } from "../stores/execution-log-store";
import { useReactFlowViewStore } from "../stores/react-flow-view-store";
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
    setName,
  } = useReactFlowViewStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setFlowVariablesObject: state.setFlowVariablesObject,
      setViewport: state.setViewport,
      setName: state.setName,
    })),
  );
  const { initLogs } = useExecutionStore();

  // Get react flow hook to set viewport
  const { fitView } = useReactFlow();

  //Get flow
  const { data, isLoading } = useQuery({
    queryKey: ["JOB_EXECUTION_DETAIL", jobId],
    queryFn: () => getAgentsExecutionLogsById(jobId ?? ""),
    enabled: !!jobId,
    select: (res) => res.data,
  });

  useEffect(() => {
    if (!data) return;
    if (!flowId) {
      setFlowId(data.flowId);
    }

    setName(data.name ?? "");
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
      setNodes(flow.nodes);
      setEdges(flow.edges);
      if (data.nodeExecutionLogs) {
        console.log(deepParse(data.nodeExecutionLogs));
        initLogs(
          deepParse(
            data.nodeExecutionLogs,
          ) as unknown as NodeExecutionLogType[],
          flow.nodes,
          flow.edges,
        );
      }
      setFlowVariablesObject(flowVarObjs || []);
      //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
      setViewportState(flow.viewport);
      // Fit view
      setTimeout(() => {
        fitView({ duration: ZOOM_ANIMATION_DURATION });
      }, ZOOM_ANIMATION_DURATION);
    }
  }, [data]);

  return { isLoading };
};
