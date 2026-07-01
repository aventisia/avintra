import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

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
  } = useReactFlowExtStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setFlowVariablesObject: state.setFlowVariablesObject,
      setViewport: state.setViewport,
    })),
  );

  // Get ReactFlowView store state & actions
  const { setVersionMeta } = useReactFlowViewStore(
    useShallow((state) => ({
      setVersionMeta: state.setVersionMeta,
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

    setVersionMeta({
      name: data.flowName ?? "",
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
      setNodes(flow?.nodes);
      setEdges(flow?.edges);

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

  return { isLoading };
};
