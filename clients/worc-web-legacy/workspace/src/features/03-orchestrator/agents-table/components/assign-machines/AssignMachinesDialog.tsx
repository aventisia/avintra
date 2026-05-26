import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { Tooltip } from "@aventisia/ui/tooltip";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useAssignMachineStore } from "../../stores/assign-machine-store";

import { AssignMachineSearch } from "./AssignMachineSearch";
import MachinesList from "./MachinesList";

const AssignMachinesDialog = () => {
  const { open, setOpen, setView, view } = useAssignMachineStore(
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
        setView("Machines");
        setOpen(open);
      }}
    >
      <DialogContent className="h-[60vh]">
        <DialogDefaultHeader heading={`Machines`} />
        <div className="h-[calc(60vh-5.1rem)] p-2 px-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-md font-semibold">
              {view == "Search" ? (
                <>
                  <Button
                    onClick={() => setView("Machines")}
                    variant={"ghost"}
                    size={"icon7"}
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Button>
                  <span>Assign Machines</span>
                </>
              ) : (
                <span className="pl-1">Assigned Machines</span>
              )}
            </div>
            {view == "Machines" ? (
              <Tooltip content="Assign Machines">
                <Button
                  onClick={() => setView("Search")}
                  variant={"ghost"}
                  size={"icon7"}
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            ) : null}
          </div>
          {view == "Machines" ? <MachinesList /> : <AssignMachineSearch />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignMachinesDialog;
