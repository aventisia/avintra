import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { Label } from "@avplatform/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { TenantPublishedAgentDto } from "../../dtos/tenant-published-agent-dto";
import { useSetFixedCreditsMutation } from "../../hooks/useSetFixedCreditsMutation";
import { TENANT_PUBLISHED_AGENTS_QUERY_KEY } from "../../hooks/useFetchTenantPublishedAgents";
import { useTenantPublishedAgentsStore } from "../../stores/tenant-published-agents-store";

export const SetFixedCreditsDialog = () => {
  const [value, setValue] = useState<string>("");

  const { tid } = useParams<{ tid: string }>();

  const { showFixedCreditsDialog, flowVersionId, setShowFixedCreditsDialog } =
    useTenantPublishedAgentsStore(
      useShallow((state) => ({
        showFixedCreditsDialog: state.showFixedCreditsDialog,
        flowVersionId: state.flowVersionId,
        setShowFixedCreditsDialog: state.setShowFixedCreditsDialog,
      })),
    );

  const queryClient = useQueryClient();

  // Find the agent being edited from the query cache
  const agentsData = queryClient.getQueryData<{ data: TenantPublishedAgentDto[] }>([
    ...TENANT_PUBLISHED_AGENTS_QUERY_KEY,
    tid,
  ]);
  const agent = agentsData?.data.find((item) => item.id === flowVersionId);

  // Sync the input value when the target agent changes
  useEffect(() => {
    setValue(agent?.fixedCredits?.toString() ?? "");
  }, [agent?.fixedCredits, flowVersionId]);

  const { isPending, mutate } = useSetFixedCreditsMutation();

  const hasFixedCredits = agent?.fixedCredits != null;

  const handleSave = () => {
    const parsed = value.trim() === "" ? null : Number(value);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;

    mutate(
      { flowVersionId, fixedCredits: parsed },
      {
        onSettled: () => setShowFixedCreditsDialog(false),
      },
    );
  };

  const handleRemove = () => {
    mutate(
      { flowVersionId, fixedCredits: null },
      {
        onSettled: () => setShowFixedCreditsDialog(false),
      },
    );
  };

  return (
    <Dialog open={showFixedCreditsDialog} onOpenChange={(open) => setShowFixedCreditsDialog(open)}>
      <DialogContent className="space-y-6 p-4">
        <DialogDefaultHeader heading="Set Fixed Credits" description={agent?.name ?? ""} />

        <div className="space-y-2">
          <Label htmlFor="fixed-credits">Fixed Credits</Label>
          <Input
            id="fixed-credits"
            type="number"
            min={0}
            placeholder="Enter fixed credits limit"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Leave empty to clear the fixed credits limit for this agent.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowFixedCreditsDialog(false)}>
            Cancel
          </Button>

          {/* Only show remove when a fixed credits value is currently set */}
          {hasFixedCredits && (
            <Button variant="caution" disabled={isPending} onClick={handleRemove}>
              Remove Fixed Credits
            </Button>
          )}

          <Button disabled={isPending} onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
