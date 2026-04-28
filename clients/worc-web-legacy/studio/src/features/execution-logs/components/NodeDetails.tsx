import { NodeDataType } from "@/types/node-data-type";

import { Button } from "@aventisia/ui/buttons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { useExecutionStore } from "../stores/execution-log-store";
import { useNodePopoverStore } from "../stores/node-popover-store";
import FELInputOutput from "./FELInputOutput/FELInputOutput";

export const NodeDetail = ({ nodeData }: { nodeData: NodeDataType }) => {
  const { openNodeId } = useNodePopoverStore();

  const { loopRegistry, activeIteration, setIteration } = useExecutionStore();
  const current = activeIteration[openNodeId ?? ""] || 0;
  const total = loopRegistry[openNodeId ?? ""]?.total || 0;
  console.log(nodeData);
  return (
    <div className="flex flex-col  bg-background gap-2 p-2">
      {nodeData.type == "forLoopNode" && (
        <>
          <Button
            variant={"ghost"}
            size={"icon5"}
            onClick={(e) => {
              e.stopPropagation();
              setIteration(openNodeId ?? "", Math.max(0, current - 1));
            }}
          >
            <ChevronLeftIcon />
          </Button>
          {current + 1} / {total}
          <Button
            variant={"ghost"}
            size={"icon5"}
            onClick={(e) => {
              e.stopPropagation();
              setIteration(openNodeId ?? "", Math.min(total - 1, current + 1));
            }}
          >
            <ChevronRightIcon />
          </Button>
        </>
      )}
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
