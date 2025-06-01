import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Edge, Node, useReactFlow, Viewport } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { getFlowToLoad } from "../apis/react-flow-apis";
import { deepParse } from "../utils/deepParse";

export const useFetchFlowToLoad = () => {
  const location = useLocation();

  // Get flow id and version id from url
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const flowId = queryParams.get("f");
  const versionId = queryParams.get("v") || undefined;

  const { setCurrentFlow, setIsFlowLoading, setProjectInfo } =
    useCurrentFlowStore(
      useShallow((state) => ({
        setCurrentFlow: state.setCurrentFlow,
        setIsFlowLoading: state.setIsFlowLoading,
        setProjectInfo: state.setProjectInfo,
      })),
    );

  // Get ReactFlowExt store state & actions
  const { setNodes, setEdges, setFlowVariablesObject, setIsPublished } =
    useReactFlowExtStore(
      useShallow((state) => ({
        setNodes: state.setNodes,
        setEdges: state.setEdges,
        setFlowVariablesObject: state.setFlowVariablesObject,
        setIsPublished: state.setIsPublished,
      })),
    );

  // Get react flow hook to set viewport
  const { setViewport, fitView } = useReactFlow();

  //Get flow
  const { data, isLoading } = useQuery({
    queryKey: ["flow", flowId, versionId],
    queryFn: () => getFlowToLoad(flowId || "flowId", versionId),
    enabled: !!flowId,
  });

  useEffect(() => {
    // Set flow loading flag
    setIsFlowLoading(isLoading);
  }, [isLoading, setIsFlowLoading]);

  useEffect(() => {
    if (!data) return;
    // eslint-disable-next-line no-debugger
    debugger;
    // Set currently opened flow
    setCurrentFlow({ id: data.data.id, name: data.data.name });
    setIsPublished(data?.data?.isPublished || false);

    // Parse react flow object
    const flow = deepParse(data.data.reactFlowObject) as unknown as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    // Parse Flow Variables Object
    const flowVarObjs = JSON.parse(data.data.flowVariablesObject);
    const projectInfo = {
      versionId: data.data.versionId,
      versionNumber: data.data.versionNumber,
      name: data.data.name,
      type: data.data.type,
    };

    if (flow) {
      // Set nodes and edges
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setFlowVariablesObject(flowVarObjs || []);
      setProjectInfo(projectInfo);

      // If flow has more than 2 nodes then set the saved viewport
      if (flow.nodes.length > 2) {
        setViewport(flow.viewport, { duration: ZOOM_ANIMATION_DURATION });
      } else {
        // Fit view if less than 2 nodes
        fitView({ duration: ZOOM_ANIMATION_DURATION });
      }
    }

    // Set document title
    document.title = `${data.data.name} - ${import.meta.env.VITE_COMPANY_NAME} ${import.meta.env.VITE_APP_NAME}`;
  }, [
    data,
    setCurrentFlow,
    setNodes,
    setEdges,
    setFlowVariablesObject,
    setProjectInfo,
    setViewport,
    fitView,
    setIsPublished,
  ]);
};
