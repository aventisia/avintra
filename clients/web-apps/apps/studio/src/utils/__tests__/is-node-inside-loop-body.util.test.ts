import { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { isNodeInsideLoopBody } from "../is-node-inside-loop-body.util";

const node = (id: string, type = "activityNode"): Node => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: type === "forLoopNode" ? { mergeBranchesNodeId: `merge-${id}` } : {},
});

const edge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
});

const nodes: Node[] = [
  node("L", "forLoopNode"),
  node("body"),
  node("break", "breakLoopNode"),
  node("branchEnd", "branchEndNode"),
  node("merge-L", "mergeBranchesNode"),
  node("outside"),
  node("inner", "forLoopNode"),
  node("merge-inner", "mergeBranchesNode"),
  node("inner-break", "breakLoopNode"),
];
const edges: Edge[] = [
  edge("L", "body"),
  edge("body", "break"),
  edge("break", "branchEnd"),
  edge("branchEnd", "merge-L"),
  edge("merge-L", "L"),
];

const nestedEdges: Edge[] = [
  ...edges,
  edge("body", "inner"),
  edge("inner", "inner-break"),
  edge("inner-break", "merge-inner"),
  edge("merge-inner", "branchEnd"),
];

describe("isNodeInsideLoopBody", () => {
  it("is true for nodes between the loop and its merge", () => {
    expect(isNodeInsideLoopBody("body", nodes, edges)).toBe(true);
    expect(isNodeInsideLoopBody("break", nodes, edges)).toBe(true);
    expect(isNodeInsideLoopBody("branchEnd", nodes, edges)).toBe(true);
  });

  it("is false for the loop itself, its merge, and unrelated nodes", () => {
    expect(isNodeInsideLoopBody("L", nodes, edges)).toBe(false);
    expect(isNodeInsideLoopBody("merge-L", nodes, edges)).toBe(false);
    expect(isNodeInsideLoopBody("outside", nodes, edges)).toBe(false);
  });

  it("treats a node inside a nested loop as inside both loops", () => {
    expect(isNodeInsideLoopBody("inner-break", nodes, nestedEdges)).toBe(true);
    expect(isNodeInsideLoopBody("merge-inner", nodes, nestedEdges)).toBe(true);
    expect(isNodeInsideLoopBody("merge-L", nodes, nestedEdges)).toBe(false);
  });
});
