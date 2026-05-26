import { ExecutionNode } from "../../types/execution-types";

import FELInputOutput from "./FELInputOutput/FELInputOutput";

export const NodeDetail = ({ node }: { node?: ExecutionNode }) => {
  if (!node) return null;

  return (
    <div className="flex flex-col gap-3 p-3">
      <FELInputOutput
        title="Input"
        jsonData={JSON.stringify(node?.inputs, null, 2) || "{}"}
      />
      <FELInputOutput
        title="Output"
        jsonData={JSON.stringify(node?.outputs, null, 2) || "{}"}
      />
    </div>
  );
};
