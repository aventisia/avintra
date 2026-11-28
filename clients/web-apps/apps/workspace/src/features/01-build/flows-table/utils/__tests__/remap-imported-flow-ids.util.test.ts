import { describe, expect, it, vi } from "vitest";

import type { FlowImportCanvas, FlowImportVariable } from "../../types/flow-import.type";
import { remapImportedFlowIds } from "../remap-imported-flow-ids.util";

// IMPORTANT NOTE: the app modules under test read `window` at import time; this suite runs in the
// default Node environment, so alias `window` to the global object before the imports evaluate.
vi.hoisted(() => {
  if (!("window" in globalThis)) {
    Object.defineProperty(globalThis, "window", { value: globalThis });
  }
});

let uuidCounter = 0;

vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(
  () =>
    `11111111-2222-4333-8444-${String(uuidCounter++).padStart(12, "0")}` as `${string}-${string}-${string}-${string}-${string}`,
);

const GROUP_A = "group-1700000000000";
const GROUP_B = "group-1700000000001";

type TestNode = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  hidden?: boolean;
  parentId?: string;
};

type TestEdge = {
  id: string;
  source: string;
  target: string;
  markerEnd?: unknown;
  data?: Record<string, unknown>;
};

const canvas = (nodes: TestNode[], edges: TestEdge[]): FlowImportCanvas =>
  ({
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
  }) as unknown as FlowImportCanvas;

const variables: FlowImportVariable[] = [{ nodeId: "node-head-a", outputs: ["Result"] }];

const collapsedGroupCanvas = () =>
  canvas(
    [
      {
        id: "node-head-a",
        type: "actionNode",
        data: {
          groupId: GROUP_A,
          isGroupHead: true,
          isExpanded: false,
          count: 2,
          hasBlock: false,
        },
      },
      { id: "node-member-a", type: "actionNode", data: { groupId: GROUP_A }, hidden: true },
      { id: "node-after", type: "actionNode", data: {} },
    ],
    [
      { id: "edge-e1", source: "node-head-a", target: "node-member-a" },
      { id: "edge-e2", source: "node-member-a", target: "node-after" },
      {
        id: `temp-${GROUP_A}-node-after`,
        source: "node-head-a",
        target: "node-after",
        markerEnd: `markerArrow_temp-${GROUP_A}-node-after`,
        data: {
          isTemporary: true,
          originalSource: "node-member-a",
          originalTarget: "node-after",
          groupId: GROUP_A,
        },
      },
    ],
  );

describe("remapImportedFlowIds", () => {
  it("keeps a collapsed group fully working with fresh ids", () => {
    const { reactFlowObject, flowVariablesObject } = remapImportedFlowIds(
      collapsedGroupCanvas(),
      variables,
    );
    const nodes = reactFlowObject.nodes as unknown as TestNode[];
    const edges = reactFlowObject.edges as unknown as TestEdge[];

    const headId = nodes.find((node) => node.data.isGroupHead)?.id;
    const memberId = nodes.find((node) => node.data.groupId && !node.data.isGroupHead)?.id;
    expect(headId).toBeDefined();
    expect(memberId).toBeDefined();
    expect(headId).not.toBe("node-head-a");
    expect(memberId).not.toBe("node-member-a");

    const head = nodes.find((node) => node.id === headId);
    const member = nodes.find((node) => node.id === memberId);
    const freshGroup = head?.data.groupId;
    expect(typeof freshGroup).toBe("string");
    expect(freshGroup).not.toBe(GROUP_A);
    expect(member?.data.groupId).toBe(freshGroup);
    expect(head?.data).toMatchObject({ isGroupHead: true, isExpanded: false, count: 2 });
    expect(member?.hidden).toBe(true);

    const bypass = edges.find((edge) => edge.data?.isTemporary);
    const afterId = nodes.find((node) => node.id !== headId && node.id !== memberId)?.id;
    expect(bypass?.data?.groupId).toBe(freshGroup);
    expect(bypass?.source).toBe(headId);
    expect(bypass?.target).toBe(afterId);
    expect(bypass?.id).toBe(`temp-${freshGroup}-${afterId}`);
    expect(bypass?.markerEnd).toBe(`markerArrow_temp-${freshGroup}-${afterId}`);
    expect(bypass?.data?.originalSource).toBe(memberId);
    expect(bypass?.data?.originalTarget).toBe(afterId);

    expect(flowVariablesObject).toEqual([{ nodeId: headId, outputs: ["Result"] }]);

    const serialized = JSON.stringify(reactFlowObject);
    for (const oldId of [
      "node-head-a",
      "node-member-a",
      "node-after",
      "edge-e1",
      "edge-e2",
      GROUP_A,
    ]) {
      expect(serialized).not.toContain(oldId);
    }
  });

  it("preserves an expanded group as expanded", () => {
    const flow = collapsedGroupCanvas();
    (flow.nodes as unknown as TestNode[]).forEach((node) => {
      if (node.data.groupId === GROUP_A) {
        node.data.isExpanded = true;
        delete node.hidden;
      }
    });

    const { reactFlowObject } = remapImportedFlowIds(flow, []);
    const nodes = reactFlowObject.nodes as unknown as TestNode[];
    const edges = reactFlowObject.edges as unknown as TestEdge[];
    const head = nodes.find((node) => node.data.isGroupHead);

    expect(head?.data.isExpanded).toBe(true);
    expect(nodes.filter((node) => node.data.groupId === head?.data.groupId)).toHaveLength(2);
    expect(nodes.some((node) => node.hidden)).toBe(false);
    const bypass = edges.find((edge) => edge.data?.isTemporary);
    expect(bypass?.data?.groupId).toBe(head?.data.groupId);
    expect(bypass?.id).toBe(`temp-${head?.data.groupId as string}-${bypass?.target}`);
  });

  it("gives each of two groups its own fresh marker and leaves other nodes alone", () => {
    const flow = canvas(
      [
        {
          id: "node-head-a",
          type: "actionNode",
          data: { groupId: GROUP_A, isGroupHead: true, isExpanded: false, count: 2 },
        },
        { id: "node-member-a", type: "actionNode", data: { groupId: GROUP_A }, hidden: true },
        {
          id: "node-head-b",
          type: "actionNode",
          data: { groupId: GROUP_B, isGroupHead: true, isExpanded: false, count: 2 },
        },
        { id: "node-member-b", type: "actionNode", data: { groupId: GROUP_B }, hidden: true },
        { id: "node-plain", type: "actionNode", data: {} },
      ],
      [
        { id: "edge-e1", source: "node-head-a", target: "node-member-a" },
        { id: "edge-e2", source: "node-member-a", target: "node-head-b" },
        { id: "edge-e3", source: "node-head-b", target: "node-member-b" },
        { id: "edge-e4", source: "node-member-b", target: "node-plain" },
        {
          id: `temp-${GROUP_A}-node-head-b`,
          source: "node-head-a",
          target: "node-head-b",
          markerEnd: `markerArrow_temp-${GROUP_A}-node-head-b`,
          data: {
            isTemporary: true,
            originalSource: "node-member-a",
            originalTarget: "node-head-b",
            groupId: GROUP_A,
          },
        },
        {
          id: `temp-${GROUP_B}-node-plain`,
          source: "node-head-b",
          target: "node-plain",
          markerEnd: `markerArrow_temp-${GROUP_B}-node-plain`,
          data: {
            isTemporary: true,
            originalSource: "node-member-b",
            originalTarget: "node-plain",
            groupId: GROUP_B,
          },
        },
      ],
    );

    const { reactFlowObject } = remapImportedFlowIds(flow, []);
    const nodes = reactFlowObject.nodes as unknown as TestNode[];
    const edges = reactFlowObject.edges as unknown as TestEdge[];
    const groups = nodes.map((node) => node.data.groupId).filter(Boolean);

    expect(groups).toHaveLength(4);
    expect(new Set(groups).size).toBe(2);
    expect(groups).not.toContain(GROUP_A);
    expect(groups).not.toContain(GROUP_B);

    const heads = nodes.filter((node) => node.data.isGroupHead);
    expect(heads).toHaveLength(2);
    for (const head of heads) {
      const members = nodes.filter(
        (node) => node.data.groupId === head.data.groupId && !node.data.isGroupHead,
      );
      expect(members).toHaveLength(1);
      expect(members[0]?.hidden).toBe(true);
      const bypass = edges.find(
        (edge) => edge.data?.isTemporary && edge.data?.groupId === head.data.groupId,
      );
      expect(bypass?.source).toBe(head.id);
      expect(bypass?.id).toBe(`temp-${head.data.groupId}-${bypass?.target}`);
      expect(bypass?.markerEnd).toBe(`markerArrow_temp-${head.data.groupId}-${bypass?.target}`);
    }

    const plain = nodes.filter((node) => !node.data.groupId);
    expect(plain).toHaveLength(1);
    expect(plain[0]?.data).toEqual({});
    const freshIds = nodes.map((node) => node.id);
    for (const oldId of ["node-head-a", "node-head-b", "node-plain", "edge-e1", "edge-e2"]) {
      expect(freshIds).not.toContain(oldId);
    }
    const serialized = JSON.stringify(reactFlowObject);
    for (const oldId of [
      "node-head-a",
      "node-member-a",
      "node-head-b",
      "node-member-b",
      "node-plain",
      "edge-e1",
      "edge-e2",
      "edge-e3",
      "edge-e4",
      GROUP_A,
      GROUP_B,
    ]) {
      expect(serialized).not.toContain(oldId);
    }
  });

  it("remaps branch, merge, and parent references without an allowlist", () => {
    const flow = canvas(
      [
        {
          id: "node-cond",
          type: "conditionalNode",
          data: { mergeBranchesNodeId: "node-merge", branches: ["node-branch"] },
        },
        { id: "node-branch", type: "actionNode", data: {} },
        { id: "node-merge", type: "mergeBranchesNode", data: {} },
        { id: "node-ai", type: "aiNode", data: {} },
        { id: "node-model", type: "modelNode", data: {}, parentId: "node-ai" },
      ],
      [
        {
          id: "edge-e1",
          source: "node-cond",
          target: "node-branch",
          markerEnd: { type: "arrow", id: "edge-e1" },
        },
        { id: "edge-e2", source: "node-branch", target: "node-merge" },
        { id: "edge-e3", source: "node-cond", target: "node-merge" },
      ],
    );

    const { reactFlowObject } = remapImportedFlowIds(flow, []);
    const nodes = reactFlowObject.nodes as unknown as TestNode[];
    const edges = reactFlowObject.edges as unknown as TestEdge[];
    const ids = new Set(nodes.map((node) => node.id));

    const markerEdge = edges.find((edge) => typeof edge.markerEnd === "object");
    expect((markerEdge?.markerEnd as { id?: string })?.id).toBe(markerEdge?.id);
    expect(JSON.stringify(markerEdge)).not.toContain("edge-e1");

    const cond = nodes.find((node) => node.data.mergeBranchesNodeId);
    expect(ids.has(cond?.data.mergeBranchesNodeId as string)).toBe(true);
    expect(ids.has((cond?.data.branches as string[])[0])).toBe(true);
    const model = nodes.find((node) => node.parentId);
    expect(ids.has(model?.parentId as string)).toBe(true);
    expect(edges.every((edge) => ids.has(edge.source) && ids.has(edge.target))).toBe(true);
  });

  it("stays consistent when the remapped canvas is imported again", () => {
    const first = remapImportedFlowIds(collapsedGroupCanvas(), variables);
    const second = remapImportedFlowIds(first.reactFlowObject, first.flowVariablesObject);
    const nodes = second.reactFlowObject.nodes as unknown as TestNode[];
    const edges = second.reactFlowObject.edges as unknown as TestEdge[];

    const head = nodes.find((node) => node.data.isGroupHead);
    const members = nodes.filter((node) => node.data.groupId === head?.data.groupId);
    expect(members.length).toBeGreaterThan(1);
    expect(edges.find((edge) => edge.data?.isTemporary)?.data?.groupId).toBe(head?.data.groupId);
    expect(head?.data.isExpanded).toBe(false);
    expect(second.flowVariablesObject[0]?.nodeId).toBe(head?.id);
  });
});
