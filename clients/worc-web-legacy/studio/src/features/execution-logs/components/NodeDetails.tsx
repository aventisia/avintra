import { NodeDataType } from "@/types/node-data-type";

import FELInputOutput from "./FELInputOutput/FELInputOutput";

export const NodeDetail = ({ nodeData }: { nodeData: NodeDataType }) => {
  return (
    <div className="flex flex-col  bg-background gap-2 p-2">
      <FELInputOutput
        title="Input"
        jsonData={JSON.stringify(nodeData.inputs, null, 2) || "{}"}
      />
      <FELInputOutput
        title="Output"
        jsonData={JSON.stringify(nodeData.outputs, null, 2) || "{}"}
      />
    </div>
  );
};
