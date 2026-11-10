import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { ArchiveIcon, ArrowUUpLeftIcon } from "@phosphor-icons/react";

import { useArchiveFlowVersionsMutation } from "../../hooks/useArchiveFlowVersions.hook";

type FlowRowArchiveActionProps = {
  rowId: string;
  name: string;
  isArchived: boolean;
  isPublished: boolean;
};

/**
 * Archive action of an agent, or Unarchive while the agent is archived; both ask
 * for confirmation and a blocked archive explains itself instead of archiving.
 */
export const FlowRowArchiveAction = ({
  rowId,
  name,
  isArchived,
  isPublished,
}: FlowRowArchiveActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { mutate: archiveFlowVersions } = useArchiveFlowVersionsMutation();

  if (isArchived) {
    return (
      <SimpleDDMenuItem
        Icon={ArrowUUpLeftIcon}
        content="Unarchive"
        onClick={() =>
          showCustomAlertDialog({
            title: `Unarchive ${name}?`,
            description:
              "This puts the agent back in the active list. Queues, triggers, machines, jobs and shared resources detached when it was archived are not reattached.",
            cancelBtnText: "Cancel",
            confirmBtnText: "Yes, unarchive",
            confirmActionFn: () => archiveFlowVersions({ flowId: rowId, archive: false }),
          })
        }
      />
    );
  }

  return (
    <SimpleDDMenuItem
      Icon={ArchiveIcon}
      content="Archive"
      onClick={() =>
        // IMPORTANT NOTE: the list only carries the latest version's published state, so an
        // older published version is caught by the server guard instead.
        isPublished
          ? showCustomAlertDialog({
              title: "Cannot archive this agent",
              description:
                "This agent has published versions that are not archived. Archive those published versions first.",
              cancelBtnText: "",
              confirmBtnText: "Close",
              confirmActionFn: () => undefined,
            })
          : showCustomAlertDialog({
              title: `Archive ${name}?`,
              description:
                "This moves the agent to the archived view and detaches its queues, triggers, machines and shared resources. Those links are not restored when you unarchive it.",
              cancelBtnText: "Cancel",
              confirmBtnText: "Yes, archive",
              confirmActionFn: () => archiveFlowVersions({ flowId: rowId, archive: true }),
            })
      }
    />
  );
};
