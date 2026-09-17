import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { useSettingsStore } from "@/features/flow-settings/stores/settings-store";
import { useImportStore } from "@/features/import-flow/stores/import-flow-store";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";

import { getFlowToLoad } from "../apis/react-flow-apis";
import { deepParse } from "../utils/deepParse";
import { getSavedViewport } from "../utils/viewport-persistence";

export const useFetchFlowToLoad = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const flowId = searchParams.get("f");
  const versionId = searchParams.get("v") || undefined;
  // Run context carried through sub-flow navigation: `j` is the job id of the run whose
  // logs we are viewing, `rv` is the root flow version that owns those logs, and `rf` is
  // the root flow id (`f`/`v` always describe the current flow). All are preserved so that
  // opening a sub-flow keeps the execution-log panel and live maps alive.
  const jobId = searchParams.get("j") || undefined;
  const runVersionId = searchParams.get("rv") || undefined;
  const runFlowId = searchParams.get("rf") || undefined;

  const autoLayout = useDagreAutoLayout();

  const { setCurrentFlow, setIsFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      setCurrentFlow: state.setCurrentFlow,
      setIsFlowLoading: state.setIsFlowLoading,
    })),
  );

  // Get  store state and actions of flow settings
  const { setSettings } = useSettingsStore(
    useShallow((state) => ({
      setSettings: state.setSettings,
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

  // Get react flow hook for fitView / setViewport
  const { fitView, setViewport } = useReactFlow();

  const { isImport } = useImportStore(useShallow((state) => ({ isImport: state.upload })));

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

  // Reset hydration when the URL changes
  useEffect(() => {
    hasHydratedRef.current = false;
  }, [flowId, versionId]);

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
      accessType: flowData.accessLevel,
      inputOutputObject: flowData.inputOutputObject || "",
      spaceId: flowData.spaceId ?? null,
      // Preserve the run context when navigating into a sub-flow (block/call-agent), so
      // the local WebSocket stays subscribed and the execution-log panel keeps working.
      jobId,
      runVersionId,
      runFlowId,
    });

    setIsPublished(flowData.isPublished || false);
    setFlowType(flowData.type || FlowTypesEnum.Agent);

    if (data?.data.settings) {
      setSettings(data?.data.settings);
    }

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
    const inputOutputObj = JSON.parse(flowData.inputOutputObject || JSON.stringify([]));

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

      // After render, restore the user's viewport for this flow version from localStorage
      // (per-user, per-flow-version position + zoom) so back-and-forth navigation between
      // parent/sub-flow and page refreshes keep the exact canvas view the developer was
      // working on (e.g. the first few nodes of a 100-node flow) instead of re-centering.
      // Only fit the view on the very first open by this user, and never zoom below 100%.
      const savedViewport = getSavedViewport(flowData.versionId);

      setTimeout(() => {
        if (savedViewport) {
          setViewport(savedViewport, { duration: ZOOM_ANIMATION_DURATION });
        } else {
          fitView({ duration: ZOOM_ANIMATION_DURATION, minZoom: 1 });
        }
        setIsFlowLoading(false);
      }, 500);
    }

    // Update document title
    document.title = `${flowData.name} - ${import.meta.env.VITE_APP_NAME} | ${import.meta.env.VITE_COMPANY_NAME}`;
  }, [data?.data]);

  return { isLoading };
};
