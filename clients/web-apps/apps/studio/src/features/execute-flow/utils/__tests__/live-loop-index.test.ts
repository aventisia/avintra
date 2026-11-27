import { Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { NodeExecutionLogType } from "../../types/execution-log-types";
import { buildLiveLoopIndex, getLiveNodeLog } from "../live-loop-index";

const log = (overrides: Partial<NodeExecutionLogType>): NodeExecutionLogType => ({
  nodeExecutionId: overrides.nodeExecutionId ?? "log",
  retryAttempt: 0,
  nodeId: overrides.nodeId ?? "node",
  nodeName: "name",
  nodeUniqueName: "unique",
  isSuccess: true,
  duration: 0,
  inputs: [],
  outputs: [],
  ...overrides,
});

const out = (key: string, value: string) => ({ key, value });

describe("buildLiveLoopIndex", () => {
  it("keys a loop merge to global despite the executor stamping it with the exited loop", () => {
    const nodes: Node[] = [
      {
        id: "loop",
        type: "forLoopNode",
        position: { x: 0, y: 0 },
        data: { mergeBranchesNodeId: "merge" },
      },
      { id: "body", type: "branchEndNode", position: { x: 0, y: 0 }, data: {} },
      { id: "merge", type: "mergeBranchesNode", position: { x: 0, y: 0 }, data: {} },
      { id: "after", type: "activityNode", position: { x: 0, y: 0 }, data: {} },
    ];
    const logs = [
      log({
        nodeExecutionId: "enter",
        nodeId: "loop",
        outputs: [out("LoopStatus", "enter")],
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({
        nodeExecutionId: "body-0",
        nodeId: "body",
        loopReferenceId: "loop",
        loopIterationIndex: 0,
      }),
      log({
        nodeExecutionId: "continue",
        nodeId: "loop",
        outputs: [out("LoopStatus", "continue")],
        loopReferenceId: "loop",
        loopIterationIndex: 1,
      }),
      log({
        nodeExecutionId: "body-1",
        nodeId: "body",
        loopReferenceId: "loop",
        loopIterationIndex: 1,
      }),
      log({
        nodeExecutionId: "exit",
        nodeId: "loop",
        outputs: [out("LoopStatus", "exit")],
        loopReferenceId: "loop",
        loopIterationIndex: 1,
      }),
      log({
        nodeExecutionId: "merge",
        nodeId: "merge",
        loopReferenceId: "loop",
        loopIterationIndex: 1,
      }),
      log({ nodeExecutionId: "after", nodeId: "after" }),
    ];

    const index = buildLiveLoopIndex(logs, nodes);

    expect(index.executionMap["||merge"]["global"]?.nodeExecutionId).toBe("merge");
    expect(index.executionMap["||merge"]["1"]).toBeUndefined();
    expect(index.nodeToParentStack["||merge"]).toBeUndefined();
    expect(getLiveNodeLog(index, "", "merge", { loop: 0 })?.nodeExecutionId).toBe("merge");
    expect(getLiveNodeLog(index, "", "body", { loop: 0 })?.nodeExecutionId).toBe("body-0");
    expect(getLiveNodeLog(index, "", "body", { loop: 1 })?.nodeExecutionId).toBe("body-1");
    expect(index.loopRegistry.loop.total).toBe(2);
  });

  it("marks a skipped loop whose log carries no loop reference", () => {
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
    const logs = [
      log({ nodeExecutionId: "before", nodeId: "before" }),
      log({ nodeExecutionId: "skip", nodeId: "loop", outputs: [out("LoopStatus", "skip")] }),
      log({ nodeExecutionId: "merge", nodeId: "merge" }),
      log({ nodeExecutionId: "after", nodeId: "after" }),
    ];

    const index = buildLiveLoopIndex(logs, nodes);

    expect(index.skippedLoops.loop?.global).toBe(true);
    expect(index.loopRegistry.loop).toBeUndefined();
    expect(index.executionMap["||loop"]["global"]?.nodeExecutionId).toBe("skip");
    expect(index.executionMap["||merge"]["global"]?.nodeExecutionId).toBe("merge");
    expect(index.executionMap["||after"]["global"]?.nodeExecutionId).toBe("after");
  });
});
