import { EmptyState } from "@avplatform/ui";
import { TextSearch } from "lucide-react";

/**
 * Renders a message to display when no actions are found.
 */
export const NoActionsMessage = () => {
  return (
    <EmptyState
      className="py-8"
      Icon={TextSearch}
      primaryMessage="No actions found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
