import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUsersStore } from "../../stores/queue-users-store";
import { SearchUsers } from "./SearchUsers";
import UsersList from "./UsersList";

const AssignUsersDialog = () => {
  const { open, setOpen, setView, view } = useQueueUsersStore(
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
        setView("Users");
        setOpen(open);
      }}
    >
      <DialogContent className="h-[60vh]">
        <DialogDefaultHeader heading={`Queue Users`} />
        <div className="h-[calc(60vh-5.1rem)] p-2 px-4 pb-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-md font-semibold">
              {view == "Search" ? (
                <>
                  <Button onClick={() => setView("Users")} variant={"ghost"} size={"icon7"}>
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Button>
                  <span>Assign User(s)</span>
                </>
              ) : (
                <span className="pl-1">Assigned User(s)</span>
              )}
            </div>
            {view == "Users" ? (
              <Tooltip content="Assign User(s)">
                <Button onClick={() => setView("Search")} variant={"ghost"} size={"icon7"}>
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            ) : null}
          </div>
          {view == "Users" ? <UsersList /> : <SearchUsers />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUsersDialog;
