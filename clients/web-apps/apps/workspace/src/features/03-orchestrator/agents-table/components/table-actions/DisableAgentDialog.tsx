import { Checkbox } from "@avplatform/ui";
import { IconTile } from "@avplatform/ui/icon-tile";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { ProhibitIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
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

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // IMPORTANT NOTE: The agents data is cached under a space-scoped key (see useFetchAgents).
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );
  const agentsData = queryClient.getQueryData<{
    data: AgentsTableDto[];
  }>([...DATA_QUERY_KEY, currentSpace?.id]);

  const agentData = agentsData?.data.find((item) => item.id === flowVersionId);

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
    <CardDialog
      isOpen={open}
      onClose={() => setOpen(false)}
      isDismissLocked={isPending}
      mark={
        <IconTile
          Icon={ProhibitIcon}
          size="lg"
          className="size-12 rounded-lg text-bad [&>svg]:size-6"
        />
      }
      eyebrow="Disable agent"
      eyebrowClassName="text-bad"
      title={agentData?.name || "Agent"}
      footer={
        <>
          <StatusLine tone="idle">Its data is kept</StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton data-autofocus onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="danger"
              disabled={isPending}
              isBusy={isPending}
              onClick={handleDisable}
            >
              {isPending ? "Disabling" : "Disable agent"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <p className="text-[13px] leading-5 text-ink-2">
        The agent will no longer be active, but its data will be retained.
      </p>
      <div className="mt-4 flex items-start gap-3 rounded-md bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => setChecked(!!value)}
          id="archive"
          className="mt-0.5"
        />
        <label htmlFor="archive" className="min-w-0">
          <span className="block text-[13px] font-semibold text-ink">Also archive this agent</span>
          <span className="block text-[12px] text-muted-foreground">
            Archives the agent from views but keeps its history.
          </span>
        </label>
      </div>
    </CardDialog>
  );
};

export default DisableAgentDialog;
