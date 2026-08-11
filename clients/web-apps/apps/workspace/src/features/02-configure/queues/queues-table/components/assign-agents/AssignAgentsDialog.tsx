import { buttonVariants } from "@avplatform/ui/buttons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tooltip } from "@avplatform/ui/tooltip";
import { X } from "lucide-react";
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
      <DialogContent className="h-[75vh] min-w-[40rem]">
        <div
          className={
            "relative flex items-center justify-between border-b p-3.5 text-lg tracking-wide"
          }
        >
          {/* Left side - Dialog Heading and description */}
          <div className="ml-2 flex flex-col">
            <DialogTitle className="flex items-center font-semibold  text-foreground">
              <span className="truncate w-[35rem]">{`Assign Agents - ${queueName ?? "Queue"}`}</span>
            </DialogTitle>
          </div>
          {/* Right side - Dialog action buttons */}
          <div className="flex items-center">
            {/* Close Dialog */}
            <Tooltip content={"Close"} shortcut="Esc">
              <DialogClose className={buttonVariants({ variant: "ghost", size: "icon8" })}>
                <X className="h-5 w-5 text-[--icon-color]" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </Tooltip>
          </div>
        </div>
        <ScrollArea className="h-[calc(75vh-4rem)]">
          <div className="p-4 pb-0">
            <SearchAgents />
          </div>

          <p className="text-md font-semibold px-4 mt-2">Assigned Agent(s)</p>
          <div className="p-2 px-4 pb-4">
            <AgentsList />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAgentsDialog;
