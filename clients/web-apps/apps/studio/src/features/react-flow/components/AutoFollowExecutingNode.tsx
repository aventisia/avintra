import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Rendered inside <ReactFlow> so it can access the `useReactFlow` instance.
 *
 * While a flow is executing, this keeps the canvas centered on the node that is
 * currently running. Whenever a NEW node transitions into `running`, the viewport
 * smoothly re-centers on it (keeping the user's current zoom level), so the user
 * does not have to manually scroll the flow to follow execution progress.
 *
 * It only reacts to the "running" transition (i.e. a node actually starting), not to
 * success/failure, and it is a no-op while no job is running, so it never interferes
 * with normal editing or the run-results review state.
 */
export const AutoFollowExecutingNode = () => {
  const { setCenter } = useReactFlow();

  const nodes = useReactFlowExtStore(useShallow((state) => state.nodes));
  const executionState = useCurrentFlowStore((state) => state.executionState);
  const liveExecutionMap = useLiveExecutionStore(useShallow((state) => state.liveExecutionMap));
  // When following execution, zoom to 100% so the running node (and its name) is clearly
  // readable. The whole-flow fitView can shrink the canvas to ~20-25% on large flows, so
  // we intentionally override the user's current zoom during a live run instead of keeping
  // it (which would leave the node too small to read).
  const EXECUTION_FOLLOW_ZOOM = 1;

  // Set of node ids that are currently `running` AND have already been followed. A node is
  // removed from this set as soon as it stops running (completes/fails), so that when a loop
  // re-enters the SAME node on a later iteration, it is followed again instead of being
  // skipped. Keying on a running-batch instead of a single last id is what fixes re-following
  // inside loops.
  const followedRunningRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // When the run ends (or is paused/reset), forget followed nodes so a future run
    // re-centers from the start instead of skipping to the old target.
    if (executionState !== "executing" && executionState !== "paused") {
      followedRunningRef.current = new Set();
      return;
    }

    const runningIds = new Set(
      Object.keys(liveExecutionMap).filter((id) => liveExecutionMap[id] === "running"),
    );
    if (runningIds.size === 0) {
      // No nodes are currently running; clear the followed set so the next running node
      // (even if it is the same id as before, e.g. the next loop iteration) is followed.
      followedRunningRef.current = new Set();
      return;
    }

    // Drop ids that are no longer running (they just completed) so they can be re-followed
    // when a loop brings them back.
    for (const id of [...followedRunningRef.current]) {
      if (!runningIds.has(id)) {
        followedRunningRef.current.delete(id);
      }
    }

    // Among the running nodes, follow the most recently-started one that we have not yet
    // followed in this running batch. Running nodes appear in insertion order, so the last
    // un-followed one is the most recently started.
    const unfollowedRunningIds = [...runningIds].filter(
      (id) => !followedRunningRef.current.has(id),
    );
    if (unfollowedRunningIds.length === 0) return;
    const targetId = unfollowedRunningIds[unfollowedRunningIds.length - 1];
    followedRunningRef.current.add(targetId);

    const node = nodes.find((n) => n.id === targetId);
    if (!node) return;

    const width = node.measured?.width ?? 220;
    const height = node.measured?.height ?? 110;
    // Canvas nodes here are flat (no parent/group nodes), so `position` is absolute.
    const cx = node.position.x + width / 2;
    const cy = node.position.y + height / 2;

    setCenter(cx, cy, { zoom: EXECUTION_FOLLOW_ZOOM, duration: 400 });
  }, [liveExecutionMap, nodes, executionState, setCenter]);

  return null;
};
