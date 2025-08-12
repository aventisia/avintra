import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useAssignAgentsStore } from "../../stores/assign-agents-store";

import AgentsList from "./AgentsList";
import { SearchAgents } from "./SearchAgents";

const AssignAgentsDialog = () => {
  const { open, setOpen, setView, view } = useAssignAgentsStore(
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
        <DialogDefaultHeader heading={`Assign Agents`} />
        <div className="h-[calc(60vh-5.1rem)] p-2">
          <div className="flex w-full items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {view == "Search" ? (
                <Button
                  onClick={() => setView("Agents")}
                  variant={"ghost"}
                  size={"icon6"}
                >
                  <ArrowLeftIcon />
                </Button>
              ) : null}
              <span>Agents</span>
            </div>
            {view == "Agents" ? (
              <Button
                onClick={() => setView("Search")}
                variant={"ghost"}
                size={"icon7"}
              >
                <PlusIcon />
              </Button>
            ) : null}
          </div>
          {view == "Agents" ? <AgentsList /> : <SearchAgents />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAgentsDialog;
