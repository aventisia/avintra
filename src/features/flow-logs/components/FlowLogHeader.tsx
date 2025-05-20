import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
  DialogTrigger,
} from "@/react-toolkit/ui/dialog";
import { FlowLogsTable } from "./FlowLogsTable";
import { ScrollArea } from "@aventisia/ui/scroll";
import FlowExecutionLog from "@/features/flow-execution-log/components";
import { useFlowExecutionLogStore } from "@/features/flow-execution-log/stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
// import { useLocation } from "react-router-dom";

const FlowLogHeader = () => {
  // Get flow execution store state & actions
  const { flowExecutionLogId, setFlowExecutionLogId } =
    useFlowExecutionLogStore(
      useShallow((state) => ({
        flowExecutionLogId: state.flowExecutionLogId,
        setFlowExecutionLogId: state.setFlowExecutionLogId,
      })),
    );

  return (
    <>
      <Dialog onOpenChange={() => setFlowExecutionLogId(null)}>
        <DialogTrigger>
          <span
            className={
              "flex h-6 items-center justify-center gap-2 text-sm font-semibold"
            }
          >
            Logs
          </span>
        </DialogTrigger>
        <DialogContent
          side="right"
          className="flex h-screen min-w-[75vw] flex-col"
        >
          <DialogDefaultHeader
            heading={flowExecutionLogId ? "Agent execution logs" : "Agent logs"}
          />
          <ScrollArea className="h-[calc(100vh-3rem)]">
            {flowExecutionLogId ? <FlowExecutionLog /> : <FlowLogsTable />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlowLogHeader;
