import { JobStatusEnum } from "@avplatform/ui/enums";
import { Node } from "@xyflow/react";
import { beforeEach, describe, expect, it } from "vitest";

import { NodeExecutionLogType } from "../../types/execution-log-types";
import { useExecutionStore } from "../execution-log-store";

const log = (overrides: Partial<NodeExecutionLogType>): NodeExecutionLogType => ({
  nodeExecutionId: overrides.nodeExecutionId ?? "log",
  retryAttempt: 0,
  nodeId: overrides.nodeId ?? "node",
  isSuccess: overrides.isSuccess ?? true,
  inputs: {},
  outputs: {},
  ...overrides,
});

const nodes: Node[] = [
  {
    id: "loop",
    type: "forLoopNode",
    position: { x: 0, y: 0 },
    data: { mergeBranchesNodeId: "merge" },
  },
  { id: "body", type: "activityNode", position: { x: 0, y: 0 }, data: {} },
];

const twoPassLogs = [
  log({
    nodeExecutionId: "enter-0",
    nodeId: "loop",
    outputs: { LoopStatus: "enter" },
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
    nodeExecutionId: "enter-1",
    nodeId: "loop",
    outputs: { LoopStatus: "continue" },
    loopReferenceId: "loop",
    loopIterationIndex: 1,
  }),
  log({
    nodeExecutionId: "body-1",
    nodeId: "body",
    loopReferenceId: "loop",
    loopIterationIndex: 1,
  }),
];

describe("execution-log store loop selection", () => {
  beforeEach(() => {
    useExecutionStore.setState({ activeIteration: {}, runStatus: null });
  });

  it("opens a loop on its last pass", () => {
    useExecutionStore.getState().initLogs(twoPassLogs, nodes, []);

    expect(useExecutionStore.getState().activeIteration.loop).toBe(1);
  });

  it("keeps an iteration hydrated from the URL", () => {
    useExecutionStore.getState().setIteration("loop", 0);
    useExecutionStore.getState().initLogs(twoPassLogs, nodes, []);

    expect(useExecutionStore.getState().activeIteration.loop).toBe(0);
  });

  it("parks a stopped run on the pass where it stopped", () => {
    useExecutionStore.getState().setRunStatus(JobStatusEnum.Killed);
    useExecutionStore.getState().initLogs(
      [
        ...twoPassLogs,
        log({
          nodeExecutionId: "stopped",
          nodeId: "body",
          isSuccess: false,
          loopReferenceId: "loop",
          loopIterationIndex: 0,
        }),
      ],
      nodes,
      [],
    );

    expect(useExecutionStore.getState().activeIteration.loop).toBe(0);
  });

  it("opens a newly selected run on its last pass", () => {
    useExecutionStore.getState().initLogs(twoPassLogs, nodes, []);
    useExecutionStore.getState().setIteration("loop", 0);

    useExecutionStore.getState().resetIterations();
    useExecutionStore.getState().initLogs(twoPassLogs, nodes, []);

    expect(useExecutionStore.getState().activeIteration.loop).toBe(1);
  });
});
