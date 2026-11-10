import { NodeRunState, useNodeRunState } from "@/components/node-container/useNodeRunState";

const edgeRunStateClass: Record<NodeRunState, string> = {
  idle: "",
  running: "edge-live",
  success: "edge-success",
  failed: "edge-error",
};

const edgeRunStateStroke: Record<NodeRunState, string> = {
  idle: "var(--line-strong)",
  running: "var(--live)",
  success: "var(--ok)",
  failed: "var(--bad)",
};

/** Run state of an edge: traversed edges into a running or failed step take that step's state. */
export const useEdgeRunState = (source: string, target: string, isTraversed: boolean) => {
  const sourceState = useNodeRunState(source);
  const targetState = useNodeRunState(target);

  const state: NodeRunState =
    isTraversed || sourceState === "success"
      ? targetState === "running" || targetState === "failed"
        ? targetState
        : isTraversed
          ? "success"
          : "idle"
      : "idle";

  return { className: edgeRunStateClass[state], stroke: edgeRunStateStroke[state] };
};
