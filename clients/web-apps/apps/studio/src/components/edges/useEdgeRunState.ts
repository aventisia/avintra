import { NodeRunState, useNodeRunState } from "@/components/node-container/useNodeRunState";

const edgeRunStateClass: Record<NodeRunState, string> = {
  idle: "",
  running: "edge-live",
  success: "edge-success",
  failed: "edge-error",
  killed: "edge-error",
  aborted: "edge-aborted",
  "not-reached": "",
};

const edgeRunStateStroke: Record<NodeRunState, string> = {
  idle: "var(--line-strong)",
  running: "var(--live)",
  success: "var(--ok)",
  failed: "var(--bad)",
  killed: "var(--bad)",
  aborted: "var(--warn)",
  "not-reached": "var(--line-strong)",
};

/** Run state of an edge: a traversed edge into a running, failed, killed or aborted step takes that step's state. */
export const useEdgeRunState = (source: string, target: string, isTraversed: boolean) => {
  const sourceState = useNodeRunState(source);
  const targetState = useNodeRunState(target);

  const isStoppedTarget =
    targetState === "running" ||
    targetState === "failed" ||
    targetState === "killed" ||
    targetState === "aborted";

  const state: NodeRunState =
    isTraversed || sourceState === "success"
      ? isStoppedTarget
        ? targetState
        : isTraversed
          ? "success"
          : "idle"
      : "idle";

  return { className: edgeRunStateClass[state], stroke: edgeRunStateStroke[state] };
};
