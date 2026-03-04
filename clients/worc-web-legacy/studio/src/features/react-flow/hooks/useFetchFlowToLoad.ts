import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useQuery } from "@tanstack/react-query";
import { Edge, Node, useReactFlow, Viewport } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { getFlowToLoad } from "../apis/react-flow-apis";
import { deepParse } from "../utils/deepParse";

export const useFetchFlowToLoad = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const flowId = searchParams.get("f");
  const versionId = searchParams.get("v") || undefined;

  const { setCurrentFlow, setIsFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      setCurrentFlow: state.setCurrentFlow,
      setIsFlowLoading: state.setIsFlowLoading,
    })),
  );

  // Get ReactFlowExt store state & actions
  const {
    setNodes,
    setEdges,
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
  const { setViewport, fitView } = useReactFlow();

  //Get flow
  const { data, isLoading } = useQuery({
    queryKey: ["flow", flowId, versionId],
    queryFn: () => getFlowToLoad(flowId || "flowId", versionId),
    enabled: !!flowId,
    staleTime: 0, // mark immediately stale
    refetchOnMount: "always", // always refetch on mount
  });

  useEffect(() => {
    // Set flow loading flag
    setIsFlowLoading(isLoading);
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

    // Parse Flow Variables Object
    const flowVarObjs = JSON.parse(
      Array.isArray(data.data.flowVariablesObject)
        ? data.data.flowVariablesObject
        : JSON.stringify([]),
    );

    const inputOutputObj = JSON.parse(
      data.data?.inputOutputObject || JSON.stringify([]),
    );

    if (flow) {
      // Set nodes and edges
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setFlowVariablesObject(flowVarObjs ?? []);
      setInputOutputObject(inputOutputObj || []);
      hydrateFlow(flow.nodes, flow.edges, flowVarObjs);
      //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
      setViewportState(flow.viewport);
      // // If flow has more than 2 nodes then set the saved viewport
      // if (flow.nodes.length > 2) {
      //   setViewport(flow.viewport, { duration: ZOOM_ANIMATION_DURATION });
      // } else {
      // Fit view if less than 2 nodes
      setTimeout(() => {
        fitView({ duration: ZOOM_ANIMATION_DURATION });
      }, ZOOM_ANIMATION_DURATION);
      // }
    }

    // Set document title
    document.title = `${data.data.name} - ${import.meta.env.VITE_APP_NAME} | ${import.meta.env.VITE_COMPANY_NAME}`;
  }, [
    data,
    setCurrentFlow,
    setNodes,
    setEdges,
    setFlowVariablesObject,
    setViewport,
    fitView,
    setIsPublished,
    setInputOutputObject,
  ]);

  return { isLoading };
};
