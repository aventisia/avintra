import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
  DialogTrigger,
} from "@aventisia/ui/dialog";
import { FlowLogsTable } from "./FlowLogsTable";
import { ScrollArea } from "@aventisia/ui/scroll";
import FlowExecutionLog from "@/features/flow-execution-log/components";
import { useFlowExecutionLogStore } from "@/features/flow-execution-log/stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
import { CircleUserIcon } from "lucide-react";
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
        <DialogTrigger className="relative inline-flex h-8 w-full cursor-default select-none items-center !justify-start gap-2 whitespace-nowrap rounded-md border border-transparent bg-transparent !px-2 py-2 text-sm font-medium outline-none ring-offset-background transition-colors duration-0 hover:bg-accent focus:border-accent focus:!bg-accent focus:text-accent-foreground focus:ring-transparent focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-80 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          <CircleUserIcon className="h-4 w-4" />
          <span>Agent Runs</span>
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
