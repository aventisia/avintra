import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useQueueAgentsStore } from "../../stores/queue-agents-store";
import AgentsList from "./AgentsList";
import { SearchAgents } from "./SearchAgents";

const AssignAgentsDialog = () => {
  const { open, setOpen, setView, view } = useQueueAgentsStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      setView: state.setView,
      view: state.view,
    })),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        setView("Agents");
        setOpen(open);
      }}
    >
      <DialogContent className="h-[60vh]">
        <DialogDefaultHeader heading={`Queue Agents`} />
        <div className="h-[calc(60vh-5.1rem)] p-2 px-4 pb-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-md font-semibold">
              {view == "Search" ? (
                <>
                  <Button onClick={() => setView("Agents")} variant={"ghost"} size={"icon7"}>
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Button>
                  <span>Assign Agent(s)</span>
                </>
              ) : (
                <span className="pl-1">Assigned Agent(s)</span>
              )}
            </div>
            {view == "Agents" ? (
              <Tooltip content="Assign Agent(s)">
                <Button onClick={() => setView("Search")} variant={"ghost"} size={"icon7"}>
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            ) : null}
          </div>
          {view == "Agents" ? <AgentsList /> : <SearchAgents />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAgentsDialog;
