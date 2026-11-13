import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { archiveAgentVersions, unarchiveAgentVersions } from "../apis/archive-agent.apis";
import type {
  AgentArchiveTarget,
  ArchiveAgentRequestContext,
  UseArchiveAgentActionOptions,
} from "../types/agent-archive.type";

type ArchiveAgentPayload = {
  flowId: string;
  archive: boolean;
};

/**
 * Archive and Unarchive actions of an agent, with a confirmation, a refusal dialog for a
 * blocked archive, and a refresh of the calling app's lists once the server accepts it.
 */
export const useArchiveAgentAction = ({
  client,
  getSpaceHeaders,
  refreshQueryKeys,
  onArchiveSettled,
}: UseArchiveAgentActionOptions) => {
  const queryClient = useQueryClient();
  const { showCustomAlertDialog } = useShowAlertHandler();
  const requestContext: ArchiveAgentRequestContext = { client, getSpaceHeaders };

  const { mutate: archiveVersions } = useMutation({
    mutationFn: ({ flowId, archive }: ArchiveAgentPayload) =>
      archive
        ? archiveAgentVersions(requestContext, flowId)
        : unarchiveAgentVersions(requestContext, flowId),

    onSuccess: (httpResponse, { flowId, archive }) => {
      onArchiveSettled?.(flowId, archive);
      refreshQueryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

      toast.success(httpResponse.message, {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error, { archive }) => {
      // IMPORTANT NOTE: the axios instance rejects 400/409/429 with the backend message and
      // toasts every other status itself, so only those refusals open the dialog.
      if (typeof error !== "string") return;

      showCustomAlertDialog({
        title: archive ? "Cannot archive this agent" : "Cannot unarchive this agent",
        description: error,
        cancelBtnText: "",
        confirmBtnText: "Close",
        confirmActionFn: () => undefined,
      });
    },
  });

  const requestArchive = (agent: AgentArchiveTarget) => {
    // IMPORTANT NOTE: only the agent's published state known to the caller is checked here;
    // an older published version is caught by the server guard instead.
    if (agent.isPublished) {
      showCustomAlertDialog({
        title: "Cannot archive this agent",
        description:
          "This agent has published versions that are not archived. Archive those published versions first.",
        cancelBtnText: "",
        confirmBtnText: "Close",
        confirmActionFn: () => undefined,
      });
      return;
    }

    showCustomAlertDialog({
      title: `Archive ${agent.name}?`,
      description:
        "This moves the agent to the archived view and detaches its queues, triggers, machines and shared resources. Those links are not restored when you unarchive it.",
      cancelBtnText: "Cancel",
      confirmBtnText: "Yes, archive",
      confirmActionFn: () => archiveVersions({ flowId: agent.id, archive: true }),
    });
  };

  const requestUnarchive = (agent: AgentArchiveTarget) =>
    showCustomAlertDialog({
      title: `Unarchive ${agent.name}?`,
      description:
        "This puts the agent back in the active list. Queues, triggers, machines, jobs and shared resources detached when it was archived are not reattached.",
      cancelBtnText: "Cancel",
      confirmBtnText: "Yes, unarchive",
      confirmActionFn: () => archiveVersions({ flowId: agent.id, archive: false }),
    });

  return { requestArchive, requestUnarchive };
};
