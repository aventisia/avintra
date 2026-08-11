import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { QueueAgentsDto } from "../../../dtos/queue-agents-dto";
import { useRemoveAgentMutation } from "../../../hooks/useRemoveAgentMutation";

interface AgentsListItemActionsProps {
  item: QueueAgentsDto;
}

/**
 * Renders a direct delete (remove) icon button for an assigned agent.
 * The access-level dropdown (Full access / Can View / Can Create / Can Edit /
 * Can Delete) has been removed; only removal is supported.
 */
export const AgentsListItemActions = ({ item }: AgentsListItemActionsProps) => {
  const { mutate: removeAgent, isPending } = useRemoveAgentMutation();
  const { showCustomAlertDialog } = useShowAlertHandler();

  const handleRemove = () => {
    showCustomAlertDialog({
      confirmActionFn: () => removeAgent(item.id ?? ""),
      title: "Remove Agent",
      confirmBtnText: "Remove",
      description: "Are you sure you want to remove this agent from the queue?",
    });
  };

  return (
    <Button
      type="button"
      variant="caution"
      size="icon7"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove agent"
    >
      {isPending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2Icon className="h-4 w-4" />
      )}
    </Button>
  );
};
