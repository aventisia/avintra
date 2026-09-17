import { useQuery } from "@tanstack/react-query";
import { Edge, Node, Viewport, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { getFlowToLoad } from "@/features/react-flow/apis/react-flow-apis";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { useBreadcrumbStore } from "@/stores/breadcrumb-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

import { getAgentsExecutionLogsById } from "../apis/job-execution-log-apis";
import { useExecutionStore } from "../stores/execution-log-store";
import { NodeExecutionLogType } from "../types/execution-log-types";

export const useReactFlowViewData = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const jobId = searchParams.get("j");
  const flowId = searchParams.get("f");
  const versionId = searchParams.get("v") || undefined;
  // Root flow id / version of the run (`f`/`v` always describe the current flow, so the root
  // run context is carried separately as `rf`/`rv`).
  const runFlowId = searchParams.get("rf") || undefined;
  const runVersionId = searchParams.get("rv") || undefined;

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

  const { initLogs } = useExecutionStore();

  // The breadcrumb trail is persisted in sessionStorage and shared with the design canvas.
  // Drop any trail that belongs to a different job so the execution-log page never shows a
  // stale trail from a previously viewed run.
  const { trail, resetBreadcrumbs } = useBreadcrumbStore();

  useEffect(() => {
    if (!jobId || trail.length === 0) return;
    if (trail.some((crumb) => crumb.jobId === jobId)) return;
    resetBreadcrumbs();
  }, [jobId, trail, resetBreadcrumbs]);

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

  // `belongsToThisJob` answers "is the current view part of the selected job's run?". A
  // sub-flow reached from this job keeps `rf`/`rv` pointing at this job's root, so it stays
  // true. If it is false the run context is a leftover from another run, and the sub-flow
  // branch is suppressed so the selected job's logs are never mapped onto a stale graph.
  // (The list panel is hidden while inside a sub-flow, so the job cannot normally change
  // there — this is a safety net.)
  const belongsToThisJob =
    !!data &&
    (runFlowId === data.flowId ||
      runVersionId === data.flowVersionId ||
      (flowId === data.flowId && versionId === data.flowVersionId));

  // The job detail always carries the ROOT flow's graph. When the user navigates into a
  // sub-flow (call-block / call-agent), `f`/`v` point at the sub-flow version, so we load
  // that version's graph instead and map the SAME job node logs onto it — the sub-flow's
  // node logs are already part of the root job's log list.
  const isSubFlowView =
    !!data &&
    !!flowId &&
    belongsToThisJob &&
    (flowId !== (runFlowId ?? data.flowId) ||
      (!!versionId && versionId !== data.flowVersionId));

  const {
    data: subFlowData,
    isFetching: isSubFlowFetching,
    isFetched: isSubFlowFetched,
  } = useQuery({
    queryKey: ["flow", flowId, versionId],
    queryFn: () => getFlowToLoad(flowId!, versionId),
    enabled: isSubFlowView,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

    // While the sub-flow graph is still loading, keep the previous canvas instead of
    // flashing the root flow's graph. If the fetch failed, fall back to the root graph.
    if (isSubFlowView && !isSubFlowFetched) return;

    const subFlowGraph = isSubFlowView ? subFlowData?.data : undefined;
    const graphSource = subFlowGraph?.reactFlowObject ?? data.reactFlowObject;

    setVersionMeta({
      name: subFlowGraph?.name ?? data.name ?? "",
      versionNumber: subFlowGraph?.versionNumber ?? data.versionNumber ?? 0,
    });
    // Parse react flow object
    const flow = deepParse(graphSource ?? JSON.stringify([])) as unknown as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    // Parse Flow Variables Object
    const flowVarObjs = JSON.parse(
      (subFlowGraph?.flowVariablesObject ?? data.flowVariablesObject) ?? JSON.stringify([]),
    );

    if (flow) {
      setNodes(flow?.nodes);
      setEdges(flow?.edges);

      if (data.nodeExecutionLogs) {
        const parsedLogs = Array.isArray(data.nodeExecutionLogs)
          ? data.nodeExecutionLogs
          : (deepParse(data.nodeExecutionLogs) as unknown as NodeExecutionLogType[]);

        initLogs(parsedLogs as NodeExecutionLogType[], flow?.nodes, flow?.edges);
      }

      setFlowVariablesObject(flowVarObjs || []);
      //set viewport state for react flow oject ext(only for reference its not for ReactFLow)
      setViewportState(flow.viewport);
      // Fit view (never zoom below 100% so nodes stay readable)
      setTimeout(() => {
        fitView({ duration: ZOOM_ANIMATION_DURATION, minZoom: 1 });
      }, ZOOM_ANIMATION_DURATION);
    } else {
      setNodes([]);
      setEdges([]);
      setFlowVariablesObject([]);
    }
  }, [data, subFlowData, isSubFlowView, isSubFlowFetched]);

  return { isPending, isLoading, isFetching: isFetching || isSubFlowFetching, isSubFlowView };
};
