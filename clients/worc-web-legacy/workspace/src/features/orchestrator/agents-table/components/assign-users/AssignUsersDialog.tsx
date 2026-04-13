import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { useAgentUsersStore } from "../../stores/agent-users-store";
import AssignToAllUsers from "./AssignToAllUsers";
import { SearchUsers } from "./SearchUsers";
import UsersList from "./UsersList";

const AssignUsersDialog = () => {
  const { open, setOpen, setView } = useAgentUsersStore(
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
      <DialogContent className="h-[65vh]">
        <DialogDefaultHeader heading={`Chat Agent Users`} />
        <ScrollArea className="h-[calc(65vh-4rem)]">
          <AssignToAllUsers />
          <SearchUsers />
          <p className="text-md font-semibold px-4">Assigned User(s)</p>
          <div className=" p-2 px-4 pb-4">
            <UsersList />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUsersDialog;
