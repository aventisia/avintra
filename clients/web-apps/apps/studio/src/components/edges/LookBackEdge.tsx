import { BaseEdge, EdgeProps, Position, useEdges, useNodes } from "@xyflow/react";
import { memo, useMemo } from "react";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { findHighestNodePosition } from "@/utils/findHighestNodePosition";

import { ChevronMarkerEnd } from "./ChevronMarkerEnd";

export const LoopBackEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, markerEnd, target }: EdgeProps) => {
    const nodes = useNodes();
    const edges = useEdges();
    const isLiveEdgeActive = useLiveExecutionStore(
      (state) => state.liveTraversedEdges[id] === true,
    );
    // `findHighestNodePosition` runs a full DFS over all edges (O(N+E)) to route the loop
    // above the flow. It is recomputed on every render — including every viewport pan/zoom
    // during live execution (AutoFollowExecutingNode animates the viewport), which made each
    // loop-back edge do O(edges) work per frame. Memoize on the stable `nodes`/`edges`/`target`
    // references so it only recomputes when the graph actually changes.
    const posData = useMemo(
      () => findHighestNodePosition(nodes, edges, target),
      [nodes, edges, target],
    );
    const targetXWithSpace = targetX;
    const targetYWithDepth = targetY;

    if (!posData) return null;

    const { y: highestY, depth } = posData;

    // ---  SPACING &  CORNERS ---
    const loopSpacing = 4;
    const safePadding = 0; // Clears the top of the highest node
    const maxRadius = 16;
    const stepOut = 0;

    // We use Math.min to find the highest coordinate (lowest number) and subtract padding to go ABOVE it
    const topY = Math.min(sourceY, targetYWithDepth, highestY) - safePadding - depth * loopSpacing;

    const stepOutX =
      sourcePosition === Position.Right
        ? sourceX + stepOut
        : sourcePosition === Position.Left
          ? sourceX - stepOut
          : sourceX; // If Top/Bottom, it stays exactly at sourceX

    // Prevent corners from glitching if distances are extremely small
    const actualR = Math.min(
      maxRadius,
      Math.abs(targetXWithSpace - stepOutX) / 2,
      Math.abs(sourceY - topY) / 2,
      Math.abs(targetYWithDepth - topY) / 2,
    );

    let path = `M ${sourceX},${sourceY} `;

    // TURN 1: If coming from a side handle, step out slightly and sharply curve UP
    if (stepOutX !== sourceX) {
      const stepDir = Math.sign(stepOutX - sourceX);
      path += `L ${stepOutX - stepDir * actualR},${sourceY} `;
      // Curve upwards (subtracting from Y)
      path += `Q ${stepOutX},${sourceY} ${stepOutX},${sourceY - actualR} `;
    }

    // RISE: Go straight up to the top floor
    // (Adding actualR keeps us just below the top line before the turn)
    path += `L ${stepOutX},${topY + actualR} `;

    // TURN 2 & 3: Curve towards target, travel the top floor, curve DOWN
    const topDir = Math.sign(targetXWithSpace - stepOutX);
    if (topDir !== 0) {
      // Sharp curve from vertical-up to horizontal
      path += `Q ${stepOutX},${topY} ${stepOutX + topDir * actualR},${topY} `;
      // Travel flat across the top roof
      path += `L ${targetXWithSpace - topDir * actualR},${topY} `;
      // Sharp curve from horizontal to vertical-down
      path += `Q ${targetXWithSpace},${topY} ${targetXWithSpace},${topY + actualR} `;
    } else {
      // Fallback if perfectly aligned vertically
      path += `L ${stepOutX},${topY} `;
    }

    // FINISH: Go dead straight down into the target handle
    path += `L ${targetXWithSpace},${targetYWithDepth}`;

    return (
      <>
        {markerEnd ? <ChevronMarkerEnd edgeId={id} stroke="1" /> : null}
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          className={isLiveEdgeActive ? "edge-success" : ""}
          style={{
            stroke: isLiveEdgeActive ? "#22c55e" : "#94a3b8",
            strokeWidth: 1,
            opacity: 0.8, // slightly softer
            fill: "none",
          }}
        />
      </>
    );
  },
);

LoopBackEdge.displayName = "LoopBackEdge";
