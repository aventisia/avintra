import { describe, expect, it } from "vitest";

import { FLOW_INPUTS_NODE_ID, applyFlowInputsToVariables } from "../flow-inputs.util";

describe("applyFlowInputsToVariables", () => {
  const nodeEntry = { nodeId: "n1", outputs: ["a"] };

  it("replaces the flow inputs entry with deduplicated Input names", () => {
    const inputOutput = [
      { direction: "Input", name: "x" },
      { direction: "Input", name: "x" },
      { direction: "Output", name: "y" },
    ];

    expect(
      applyFlowInputsToVariables(
        [nodeEntry, { nodeId: FLOW_INPUTS_NODE_ID, outputs: ["old"] }],
        JSON.stringify(inputOutput),
      ),
    ).toEqual([nodeEntry, { nodeId: FLOW_INPUTS_NODE_ID, outputs: ["x"] }]);
  });

  it("returns the same array when nothing changes", () => {
    const variables = [nodeEntry];
    expect(applyFlowInputsToVariables(variables, "not json")).toBe(variables);
  });
});
