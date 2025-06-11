import FELInputOutput from "@/features/flow-execution-log/components/FELInputOutput/FELInputOutput";
import { useFlowExecutionLogStore } from "../stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchExecutionLogs } from "../hooks/useFetchFlowExecutionLogs";

export const NodeDetail = () => {
  // Get flow execution store state & actions
  const { selectedNodeId, selectedExecutionId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      selectedExecutionId: state.selectedExecutionId,
      selectedNodeId: state.selectedNodeId,
    })),
  );

  const { data: executions } = useFetchExecutionLogs();

  const node = executions
    ?.find((e) => e.executionId === selectedExecutionId)
    ?.nodes.find((n) => n.nodeId === selectedNodeId);

  if (!node) return null;

  return (
    <div className="flex flex-col gap-2 p-2">
      <FELInputOutput
        title="Input"
        jsonData={JSON.stringify(node.inputs, null, 2) || "{}"}
      />
      <FELInputOutput
        title="Output"
        jsonData={JSON.stringify(node.outputs, null, 2) || "{}"}
      />
    </div>
  );
};
