import { Checkbox, LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent } from "@avplatform/ui/dialog";
import { Label } from "@avplatform/ui/label";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { DATA_QUERY_KEY } from "../../constants";
import { AgentsTableDto } from "../../dtos/agents-table-dto";
import { useUpdateAgentMutation } from "../../hooks/useUpdateAgentMutation";
import { useDisableAgentStore } from "../../stores/disable-agent-store";

const DisableAgentDialog = () => {
  const [checked, setChecked] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const { open, setOpen, flowVersionId } = useDisableAgentStore(
    useShallow((state) => ({
      open: state.showDialog,
      flowVersionId: state.flowVersionId,
      setOpen: state.setShowDialog,
    })),
  );

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // The agents data is cached under a space-scoped key (see useFetchAgents)
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );
  const agentsData = queryClient.getQueryData<{
    data: AgentsTableDto[];
  }>([...DATA_QUERY_KEY, currentSpace?.id]);

  // Get agent data by id
  const agentData = agentsData?.data.find((item) => item.id === flowVersionId);

  // Define mutation using React Query
  const { isPending, mutate } = useUpdateAgentMutation();

  const handleDisable = () => {
    if (agentData)
      mutate({
        ...agentData,
        lastModifiedBy: userSession?.email ?? "",
        lastModifiedOn: new Date(),
        isArchived: checked,
        isDisabled: true,
      });
  };
  return (
    <Dialog open={open} onOpenChange={(open: boolean) => setOpen(open)}>
      <DialogContent className="space-y-6 p-4">
        <div className="space-y-2">
          <h2 className="text-heading">Disable Agent</h2>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to disable this agent? They will no longer be active, but their
            data will be retained.
          </p>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => setChecked(!!value)}
              id="archive"
            />
            <div className="grid gap-2">
              <Label htmlFor="archive"> Also archive this agent</Label>
              <p className="text-sm text-muted-foreground">
                Archives the agent from views but keeps their history.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={handleDisable}>
            {isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
            Disable Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisableAgentDialog;
