import { Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { NodeExecutionLogType } from "../../types/execution-log-types";
import { mapLogsToFlow } from "../execution-log-parser";

const log = (overrides: Partial<NodeExecutionLogType>): NodeExecutionLogType => ({
  nodeExecutionId: overrides.nodeExecutionId ?? "log",
  retryAttempt: 0,
  nodeId: overrides.nodeId ?? "node",
  isSuccess: overrides.isSuccess ?? true,
  inputs: {},
  outputs: {},
  ...overrides,
});

const loopNodes: Node[] = [
  { id: "loop", type: "forLoopNode", position: { x: 0, y: 0 }, data: {} },
  { id: "block", type: "blockNode", position: { x: 0, y: 0 }, data: {} },
];

const innerNodes: Node[] = [
  { id: "inner", type: "activityNode", position: { x: 0, y: 0 }, data: {} },
];

describe("mapLogsToFlow", () => {
  it("attributes a sub-flow step invoked from a loop to the loop iteration and caller", () => {
    const logs = [
      log({
        nodeExecutionId: "loop-2",
        nodeId: "loop",
        outputs: { LoopStatus: "enter" },
        loopReferenceId: "loop",
        loopIterationIndex: 2,
      }),
      log({
        nodeExecutionId: "inner-2",
        nodeId: "inner",
        callerReferenceId: "block",
        loopReferenceId: "loop",
        loopIterationIndex: 2,
      }),
      log({
        nodeExecutionId: "inner-3",
        nodeId: "inner",
        callerReferenceId: "block",
        loopReferenceId: "loop",
        loopIterationIndex: 3,
      }),
    ];

    const result = mapLogsToFlow(logs, innerNodes, [], "block");

    expect(result.executionMap.inner["2"].nodeExecutionId).toBe("inner-2");
    expect(result.executionMap.inner["3"].nodeExecutionId).toBe("inner-3");
    expect(result.nodeToParentStack.inner).toEqual(["loop"]);
    expect(result.loopRegistry.loop.total).toBe(4);
  });

  it("reports the last logged step as the stopped step for the selected path", () => {
    const logs = [
      log({ nodeExecutionId: "block", nodeId: "block" }),
      log({ nodeExecutionId: "inner", nodeId: "inner", callerReferenceId: "block" }),
    ];

    const result = mapLogsToFlow(logs, [...loopNodes, ...innerNodes], []);

    expect(result.stoppedAt).toEqual({ nodeId: "inner", pathKey: "global" });
  });

  it("keys the stopped step to the iteration that produced the last log", () => {
    const logs = [
      log({
        nodeExecutionId: "loop-inst",
        nodeId: "loop",
        outputs: { LoopStatus: "enter" },
        loopIterationIndex: 1,
      }),
      log({
        nodeExecutionId: "inner-1",
        nodeId: "inner",
        loopReferenceId: "loop",
        loopIterationIndex: 1,
      }),
    ];

    const result = mapLogsToFlow(logs, [...loopNodes, ...innerNodes], []);

    expect(result.stoppedAt).toEqual({ nodeId: "inner", pathKey: "1" });
  });

  it("skips the invisible structural nodes when picking the stopped step", () => {
    const nodes: Node[] = [
      { id: "breakLoop", type: "breakLoopNode", position: { x: 0, y: 0 }, data: {} },
      { id: "branchEnd", type: "branchEndNode", position: { x: 0, y: 0 }, data: {} },
      { id: "merge", type: "mergeBranchesNode", position: { x: 0, y: 0 }, data: {} },
    ];
    const logs = [
      log({ nodeExecutionId: "break", nodeId: "breakLoop" }),
      log({ nodeExecutionId: "end", nodeId: "branchEnd" }),
      log({ nodeExecutionId: "merge", nodeId: "merge" }),
    ];

    const result = mapLogsToFlow(logs, nodes, []);

    expect(result.stoppedAt).toEqual({ nodeId: "breakLoop", pathKey: "global" });
  });

  it("has no stopped step when the run produced no logs", () => {
    const result = mapLogsToFlow([], loopNodes, []);

    expect(result.stoppedAt).toBeNull();
  });

  it("keys a loop merge to global despite the executor stamping it with the exited loop", () => {
    const nodes: Node[] = [
      {
        id: "loop",
        type: "forLoopNode",
        position: { x: 0, y: 0 },
        data: { mergeBranchesNodeId: "merge" },
      },
      { id: "bodyStart", type: "branchStartNode", position: { x: 0, y: 0 }, data: {} },
      { id: "bodyEnd", type: "branchEndNode", position: { x: 0, y: 0 }, data: {} },
      { id: "merge", type: "mergeBranchesNode", position: { x: 0, y: 0 }, data: {} },
      { id: "after", type: "activityNode", position: { x: 0, y: 0 }, data: {} },
    ];
    const edges = [
      { id: "loop-body", source: "loop", target: "bodyStart" },
      { id: "body", source: "bodyStart", target: "bodyEnd" },
      { id: "exit", source: "bodyEnd", target: "merge" },
      { id: "next", source: "merge", target: "after" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ].map((e) => ({ ...e }) as any);
    const logs = [
      log({
        nodeExecutionId: "enter",
        nodeId: "loop",
        outputs: { LoopStatus: "enter" },
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({
        nodeExecutionId: "start",
        nodeId: "bodyStart",
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({
        nodeExecutionId: "end",
        nodeId: "bodyEnd",
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({
        nodeExecutionId: "exit",
        nodeId: "loop",
        outputs: { LoopStatus: "exit" },
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({
        nodeExecutionId: "merge",
        nodeId: "merge",
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({ nodeExecutionId: "after", nodeId: "after" }),
    ];

    const result = mapLogsToFlow(logs, nodes, edges);

    expect(result.executionMap.merge.global.nodeExecutionId).toBe("merge");
    expect(result.executionMap.merge["0"]).toBeUndefined();
    expect(result.nodeToParentStack.merge).toBeUndefined();
    expect(result.traversedEdges.exit?.global).toBe(true);
  });

  it("marks a skipped loop and keeps the path after it green", () => {
    const nodes: Node[] = [
      { id: "before", type: "activityNode", position: { x: 0, y: 0 }, data: {} },
      {
        id: "loop",
        type: "forLoopNode",
        position: { x: 0, y: 0 },
        data: { mergeBranchesNodeId: "merge" },
      },
      { id: "merge", type: "mergeBranchesNode", position: { x: 0, y: 0 }, data: {} },
      { id: "after", type: "activityNode", position: { x: 0, y: 0 }, data: {} },
    ];
    const edges = [
      { id: "into-loop", source: "before", target: "loop" },
      { id: "loop-exit", source: "loop", target: "merge" },
      { id: "after-merge", source: "merge", target: "after" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ].map((e) => ({ ...e }) as any);
    const logs = [
      log({ nodeExecutionId: "before", nodeId: "before" }),
      log({
        nodeExecutionId: "skip",
        nodeId: "loop",
        outputs: { LoopStatus: "skip", ConditionsResult: "False" },
      }),
      log({ nodeExecutionId: "merge", nodeId: "merge" }),
      log({ nodeExecutionId: "after", nodeId: "after" }),
    ];

    const result = mapLogsToFlow(logs, nodes, edges);

    expect(result.skippedLoops.loop?.global).toBe(true);
    expect(result.loopRegistry.loop?.total ?? 0).toBe(0);
    expect(result.executionMap.loop.global.nodeExecutionId).toBe("skip");
    expect(result.traversedEdges["into-loop"]?.global).toBe(true);
    expect(result.traversedEdges["loop-exit"]?.global).toBe(true);
    expect(result.traversedEdges["after-merge"]?.global).toBe(true);
  });
});
