import { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { getNodesAndEdgesAfterDeletion } from "../getNodesAndEdgesAfterDeletion";

const router = (overrides: Record<string, unknown> = {}): Node =>
  ({
    id: "router",
    type: "conditionalNode",
    position: { x: 0, y: 0 },
    data: {
      branches: ["case", "default"],
      defaultBranchNodeId: "default",
      mergeBranchesNodeId: "merge",
      conditional2DefaultBranchEdgeId: "router-default-edge",
      ...overrides,
    },
  }) as Node;

const branchStart = (id: string): Node =>
  ({
    id,
    type: "branchNode1",
    position: { x: 0, y: 0 },
    data: { mergeBranchesNodeId: "merge" },
  }) as Node;

const branchEnd = (id: string): Node =>
  ({
    id,
    type: "branchEndNode",
    position: { x: 0, y: 0 },
    data: { mergeBranchesNodeId: "merge" },
  }) as Node;

const mergeNode = (): Node =>
  ({ id: "merge", type: "mergeBranchesNode", position: { x: 0, y: 0 }, data: {} }) as Node;

const edge = (id: string, source: string, target: string): Edge => ({ id, source, target }) as Edge;

const canvas = () => ({
  nodes: [
    router(),
    branchStart("case"),
    branchStart("default"),
    branchEnd("case-end"),
    branchEnd("default-end"),
    mergeNode(),
  ],
  edges: [
    edge("router-case-edge", "router", "case"),
    edge("router-default-edge", "router", "default"),
    edge("case-end-edge", "case", "case-end"),
    edge("case-end-merge-edge", "case-end", "merge"),
    edge("default-end-edge", "default", "default-end"),
    edge("default-end-merge-edge", "default-end", "merge"),
  ],
});

describe("getNodesAndEdgesAfterDeletion for router branches", () => {
  it("deletes the Default branch and clears both default references on the router", () => {
    const { nodes, edges } = canvas();
    const target = nodes.find((n) => n.id === "default")!;

    const result = getNodesAndEdgesAfterDeletion({
      node: target,
      nodes,
      edges,
      flowVariables: [],
    });

    const updatedRouter = result.updatedNodes.find((n) => n.id === "router")!;
    expect(updatedRouter.data?.branches).toEqual(["case"]);
    expect(updatedRouter.data?.defaultBranchNodeId).toBeUndefined();
    expect(updatedRouter.data?.conditional2DefaultBranchEdgeId).toBeUndefined();
    expect(result.updatedNodes.some((n) => n.id === "default")).toBe(false);
    expect(result.updatedNodes.some((n) => n.id === "default-end")).toBe(false);
    expect(result.updatedNodes.some((n) => n.id === "case")).toBe(true);
  });

  it("keeps the default references when deleting a Case branch", () => {
    const { nodes, edges } = canvas();
    const target = nodes.find((n) => n.id === "case")!;

    const result = getNodesAndEdgesAfterDeletion({
      node: target,
      nodes,
      edges,
      flowVariables: [],
    });

    const updatedRouter = result.updatedNodes.find((n) => n.id === "router")!;
    expect(updatedRouter.data?.branches).toEqual(["default"]);
    expect(updatedRouter.data?.defaultBranchNodeId).toBe("default");
    expect(updatedRouter.data?.conditional2DefaultBranchEdgeId).toBe("router-default-edge");
  });

  it("blocks deleting the last remaining branch", () => {
    const { nodes, edges } = canvas();
    const routerOnlyCase = nodes.map((n) =>
      n.id === "router"
        ? router({
            branches: ["case"],
            defaultBranchNodeId: undefined,
            conditional2DefaultBranchEdgeId: undefined,
          })
        : n,
    );
    const target = routerOnlyCase.find((n) => n.id === "case")!;

    expect(() =>
      getNodesAndEdgesAfterDeletion({
        node: target,
        nodes: routerOnlyCase,
        edges,
        flowVariables: [],
      }),
    ).toThrow("At least one branch is required.");
  });
});
