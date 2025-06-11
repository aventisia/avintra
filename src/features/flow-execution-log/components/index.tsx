import { useFlowExecutionLogStore } from "@/features/flow-execution-log/stores/flow-execution-lof-store";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { ExecutionList } from "./ExecutionList";
import { NodeList } from "./NodeList";
import { NodeDetail } from "./NodeDetails";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

const ExecutionLogDialog = () => {
  // Get flow execution store state & actions
  const { setShowDialog, showDialog } = useFlowExecutionLogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get ReactFlowExt store state & actions
  const { isPublished } = useReactFlowExtStore(
    useShallow((state) => ({
      isPublished: state.isPublished,
    })),
  );
  return (
    <>
      <Dialog
        open={showDialog}
        onOpenChange={() => {
          setShowDialog(!showDialog);
        }}
      >
        <DialogContent
          side="left"
          className={`flex h-screen flex-col ${isPublished ? "min-w-[75vw]" : "min-w-[50vw]"}`}
        >
          <DialogDefaultHeader heading={"Agent execution logs"} />
          <div
            className={`grid h-[calc(100vh-4rem)] divide-x ${isPublished ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {isPublished && <ExecutionList />}
            <NodeList />
            <NodeDetail />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExecutionLogDialog;
