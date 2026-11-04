import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { CoinsIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { TenantPublishedAgentDto } from "../../dtos/tenant-published-agent-dto.ee";
import { TENANT_PUBLISHED_AGENTS_QUERY_KEY } from "../../hooks/useFetchTenantPublishedAgents.ee";
import { useSetFixedCreditsMutation } from "../../hooks/useSetFixedCreditsMutation.ee";
import { useTenantPublishedAgentsStore } from "../../stores/tenant-published-agents-store.ee";

/**
 * Sets or clears the fixed credits a published agent is charged per run.
 */
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

  const isInvalid = value.trim() !== "" && (Number.isNaN(Number(value)) || Number(value) < 0);
  const isChanged = value !== (agent?.fixedCredits?.toString() ?? "");

  return (
    <CardDialog
      isOpen={showFixedCreditsDialog}
      onClose={() => setShowFixedCreditsDialog(false)}
      isDismissLocked={isPending}
      isOutsideClickLocked={isChanged}
      mark={<IconTile Icon={CoinsIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow="Set fixed credits"
      title={agent?.name ?? "Published agent"}
      footer={
        <>
          <StatusLine tone={isPending || isChanged ? "pending" : "idle"}>
            {isPending ? "Saving" : isChanged ? "Unsaved changes" : "No changes yet"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={() => setShowFixedCreditsDialog(false)} disabled={isPending}>
              Cancel
            </CardDialogButton>
            {hasFixedCredits && (
              <CardDialogButton
                className="text-bad hover:text-bad"
                disabled={isPending}
                onClick={handleRemove}
              >
                Remove fixed credits
              </CardDialogButton>
            )}
            <CardDialogButton
              variant="primary"
              disabled={isPending || isInvalid}
              isBusy={isPending}
              onClick={handleSave}
            >
              Save
            </CardDialogButton>
          </div>
        </>
      }
    >
      <FormField
        htmlFor="fixed-credits"
        label="Fixed credits"
        isOptional
        error={isInvalid ? "Enter a number of 0 or more" : null}
        hint={
          <p className="pt-1.5 text-[12px] leading-5 text-muted-foreground">
            Sets a fixed credit amount deducted for every run of this agent, replacing the default
            credit mechanism. Leave empty to clear the override and use the default.
          </p>
        }
      >
        <input
          id="fixed-credits"
          data-autofocus
          type="number"
          min={0}
          placeholder="e.g. 50"
          aria-invalid={isInvalid}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(getFieldInputClassName(isInvalid), "h-11")}
        />
      </FormField>
    </CardDialog>
  );
};
