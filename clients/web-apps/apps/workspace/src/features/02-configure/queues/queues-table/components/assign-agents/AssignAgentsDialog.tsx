import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { useQueueAgentsStore } from "../../stores/queue-agents-store";
import AgentsList from "./AgentsList";
import { SearchAgents } from "./SearchAgents";

const AssignAgentsDialog = () => {
  const { open, setOpen, queueName } = useQueueAgentsStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      queueName: state.queueName,
    })),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        setOpen(open);
      }}
    >
      <DialogContent className="flex h-[75vh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0">
        <DialogDefaultHeader
          heading="Assign agents"
          description={
            queueName ? `Choose which agents process items from “${queueName}”.` : undefined
          }
        />
        <ScrollArea className="flex-1">
          <div className="border-b bg-muted/40 px-5 py-4">
            <SearchAgents />
          </div>
          <div className="px-5 py-4">
            <AgentsList />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAgentsDialog;
