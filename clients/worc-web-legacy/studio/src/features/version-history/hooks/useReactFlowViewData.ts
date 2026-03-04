import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { Edge, Node, useReactFlow, Viewport } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowViewStore } from "../stores/react-flow-view-store";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { useQuery } from "@tanstack/react-query";
import { getAgentsHistoryById } from "../apis/agents-history-apis";

export const useReactFlowViewData = () => {
  const [searchParams] = useSearchParams();

  const historyId = searchParams.get("h");

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

  // Get react flow hook to set viewport
  const { fitView } = useReactFlow();

  //Get flow
  const { data, isLoading } = useQuery({
    queryKey: ["AGENT_HISTORY_DETAIL", historyId],
    queryFn: () => getAgentsHistoryById(historyId ?? ""),
    enabled: !!historyId,
    select: (res) => res.data,
  });

  useEffect(() => {
    if (!data) return;

    setName(data.flowName ?? "");
    // Parse react flow object
    const flow = deepParse(
      data?.reactFlowObject ?? JSON.stringify([]),
    ) as unknown as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    // Parse Flow Variables Object
    const flowVarObjs = JSON.parse(data?.flowVariablesObject ?? "{}");

    if (flow) {
      // Set nodes and edges
      setNodes(flow.nodes);
      setEdges(flow.edges);
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
