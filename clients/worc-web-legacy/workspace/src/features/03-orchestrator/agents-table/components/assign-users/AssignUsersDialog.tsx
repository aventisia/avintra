import CustomCheckbox from "@/components/CustomCheckbox";

import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { DATA_QUERY_KEY } from "../../constants";
import { AgentsTableDto } from "../../dtos/agents-table-dto";
import { useAgentUsersStore } from "../../stores/agent-users-store";
import { SearchUsers } from "./SearchUsers";
import UsersList from "./UsersList";

const AssignUsersDialog = () => {
  const { open, setOpen, flowVersionId } = useAgentUsersStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      flowVersionId: state.flowVersionId,
    })),
  );
  // Get query client
  const queryClient = useQueryClient();

  // The draft state (Checkbox)
  const [assignAll, setAssignAll] = useState(false);
  // The backend truth state
  const [savedAssignAll, setSavedAssignAll] = useState(false);

  useEffect(() => {
    if (open) {
      const flowsData = queryClient.getQueryData<{
        data: AgentsTableDto[];
      }>(DATA_QUERY_KEY);

      const flowData = flowsData?.data.find(
        (item) => item.id === flowVersionId,
      );
      const isAssignedToAll = !!flowData?.isAssignedToAllUsers;

      setAssignAll(isAssignedToAll);
      setSavedAssignAll(isAssignedToAll);
    }
  }, [open, flowVersionId, queryClient]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[65vh]">
        <DialogDefaultHeader heading={`Chat Agent Users`} />
        <ScrollArea className="h-[calc(65vh-4rem)]">
          <div className="p-4 pb-0">
            <CustomCheckbox
              checked={assignAll}
              label="Assign to all team members"
              description="All users in this tenant will be assigned automatically"
              onCheckedChange={setAssignAll}
            />
          </div>

          <SearchUsers
            assignAll={assignAll}
            savedAssignAll={savedAssignAll}
            onUpdateSuccess={(newValue) => setSavedAssignAll(newValue)}
          />

          {/* List only shows/hides based on the SAVED backend state */}
          {!savedAssignAll && (
            <>
              <p className="text-md font-semibold px-4 mt-2">
                Assigned User(s)
              </p>
              <div className="p-2 px-4 pb-4">
                <UsersList />
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUsersDialog;
