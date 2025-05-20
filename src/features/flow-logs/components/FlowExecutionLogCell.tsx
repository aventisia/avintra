import { useFlowExecutionLogStore } from "@/features/flow-execution-log/stores/flow-execution-lof-store";
// import { cn } from "@aventisia/ui/lib";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useShallow } from "zustand/react/shallow";

interface FlowExecutionLogCellProps {
  /** The ID of the flow to view execution logs. */
  flowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const FlowExecutionLogCell = ({
  flowId,
  cellValue,
}: FlowExecutionLogCellProps) => {
  const { setFlowExecutionLogId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      flowExecutionLogId: state.flowExecutionLogId,
      setFlowExecutionLogId: state.setFlowExecutionLogId,
    })),
  );

  // Return the component
  return (
    <Button onClick={() => setFlowExecutionLogId(flowId)} variant={"link"}>
      {cellValue}
    </Button>
  );
};
