import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { useImportStore } from "@/features/import-flow/stores/import-flow-store";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";

import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
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
    setFlowVariablesObject,
    setInputOutputObject,
    setIsPublished,
    setFlowType,
    hydrateFlow,
    setViewport: setViewportState,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      setFlowVariablesObject: state.setFlowVariablesObject,
      setInputOutputObject: state.setInputOutputObject,
      setIsPublished: state.setIsPublished,
      setViewport: state.setViewport,
      hydrateFlow: state.hydrateFlow,
      setFlowType: state.setFlowType,
    })),
  );

  // Get react flow hook for fitView
  const { fitView } = useReactFlow();

  // Ensures hydration runs only once
  const hasHydratedRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["flow", flowId, versionId],
    queryFn: () => getFlowToLoad(flowId!, versionId),
    enabled: !!flowId,

    // Prevent any automatic refetch
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Track loading state in store
  useEffect(() => {
    setIsFlowLoading(isLoading);
  }, [isLoading, setIsFlowLoading]);
  const { isImport } = useImportStore(
    useShallow((state) => ({ isImport: state.upload })),
  );

  // One-time hydration from server data
  useEffect(() => {
    if (!data?.data || (hasHydratedRef.current && !!isImport)) return;

    hasHydratedRef.current = true;

    const flowData = data.data;

    setCurrentFlow({
      id: flowData.id,
      name: flowData.name,
      versionId: flowData.versionId,
      versionNumber: flowData.versionNumber,
      isPublished: flowData.isPublished || false,
      isLocked: flowData.isLocked || false,
      isDraft: flowData.isDraft || false,
      isArchived: flowData.isArchived || false,
      type: flowData.type,
      description: flowData.description || "",
      accessType: flowData.accessType,
    });

    setIsPublished(flowData.isPublished || false);
    setFlowType(flowData.type || FlowTypesEnum.Agent);

    // Ensure versionId is present in URL
    if (!searchParams.has("v")) {
      searchParams.set("v", flowData.versionId);
      setSearchParams(searchParams, { replace: true });
    }

    // Parse flow JSON safely
    const flow = deepParse(flowData.reactFlowObject) as unknown as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    // Parse flow variables
    let flowVarObjs: FlowVariablesObjectType[] = [];
    try {
      const parsed = JSON.parse(flowData.flowVariablesObject);
      flowVarObjs = Array.isArray(parsed) ? parsed : [];
    } catch {
      flowVarObjs = [];
    }

    // Parse input/output
    const inputOutputObj = JSON.parse(
      flowData.inputOutputObject || JSON.stringify([]),
    );

    if (flow) {
      setFlowVariablesObject(flowVarObjs);
      setInputOutputObject(inputOutputObj);

      // Apply layout before hydration
      const { nodes, edges } = autoLayout({
        newEdges: flow.edges,
        newNodes: flow.nodes,
      });

      hydrateFlow(nodes, edges, flowVarObjs);

      // Store viewport reference
      setViewportState(flow.viewport);

      // Fit view after render
      setTimeout(() => {
        fitView({ duration: ZOOM_ANIMATION_DURATION });
        setIsFlowLoading(false);
      }, 500);
    }

    // Update document title
    document.title = `${flowData.name} - ${import.meta.env.VITE_APP_NAME} | ${import.meta.env.VITE_COMPANY_NAME}`;
  }, [data?.data]);

  return { isLoading };
};
