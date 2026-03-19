import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";

import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getFlowToLoad } from "../apis/react-flow-apis";
import { deepParse } from "../utils/deepParse";

export const useFetchFlowToLoad = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const flowId = searchParams.get("f");
  const versionId = searchParams.get("v") || undefined;

  const autoLayout = useDagreAutoLayout();
  const { setCurrentFlow, setIsFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      setCurrentFlow: state.setCurrentFlow,
      setIsFlowLoading: state.setIsFlowLoading,
    })),
  );

  // Get ReactFlowExt store state & actions
  const {
    // setNodes,
    // setEdges,
    setFlowVariablesObject,
    setInputOutputObject,
    setIsPublished,
    hydrateFlow,
    setViewport: setViewportState,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setFlowVariablesObject: state.setFlowVariablesObject,
      setInputOutputObject: state.setInputOutputObject,
      setIsPublished: state.setIsPublished,
      setViewport: state.setViewport,
      hydrateFlow: state.hydrateFlow,
    })),
  );

  // Get react flow hook to set viewport
  const { fitView } = useReactFlow();

  //Get flow
  const { data, isLoading } = useQuery({
    queryKey: ["flow", flowId, versionId],
    queryFn: () => getFlowToLoad(flowId || "flowId", versionId),
    enabled: !!flowId,
    staleTime: 0, // mark immediately stale
    refetchOnMount: "always", // always refetch on mount
  });

  useEffect(() => {
    if (isLoading) {
      // Set flow loading flag
      setIsFlowLoading(isLoading);
    }
  }, [isLoading, setIsFlowLoading]);

  useEffect(() => {
    if (!data?.data) return;
    // Set currently opened flow
    setCurrentFlow({
      id: data.data.id,
      name: data.data.name,
      versionId: data.data.versionId,
      versionNumber: data.data.versionNumber,
      isPublished: data.data.isPublished || false,
      isLocked: data.data.isLocked || false,
      isDraft: data.data.isDraft || false,
      isArchived: data.data.isArchived || false,
      type: data.data.type,
      description: data.data.description || "",
      accessType: data.data.accessType,
    });
    setIsPublished(data?.data?.isPublished || false);

    // Check if 'v' query parameter exists
    if (!searchParams.has("v")) {
      searchParams.set("v", data.data.versionId);
      setSearchParams(searchParams, { replace: true });
    }

    // Parse react flow object
    const flow = deepParse(data.data.reactFlowObject) as unknown as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    let flowVarObjs: FlowVariablesObjectType[] = [];

    try {
      const parsed = JSON.parse(data.data.flowVariablesObject);
      flowVarObjs = Array.isArray(parsed) ? parsed : [];
    } catch {
      flowVarObjs = [];
    }

    const inputOutputObj = JSON.parse(
      data.data?.inputOutputObject || JSON.stringify([]),
    );

    if (flow) {
      setFlowVariablesObject(flowVarObjs ?? []);
      setInputOutputObject(inputOutputObj || []);

      // Set nodes and edges
      const { nodes, edges } = autoLayout({
        newEdges: flow.edges,
        newNodes: flow.nodes,
      });

      hydrateFlow(nodes, edges, flowVarObjs);
      //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
      setViewportState(flow.viewport);
      // Fit view
      setTimeout(() => {
        fitView({ duration: ZOOM_ANIMATION_DURATION });
        setIsFlowLoading(false);
      }, 500);
    }

    // Set document title
    document.title = `${data.data.name} - ${import.meta.env.VITE_APP_NAME} | ${import.meta.env.VITE_COMPANY_NAME}`;
  }, [data?.data]);

  return { isLoading };
};
