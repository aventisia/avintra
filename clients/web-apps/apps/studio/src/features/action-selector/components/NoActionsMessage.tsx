import { EmptyState } from "@avplatform/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/**
 * Renders a message to display when no actions are found.
 */
export const NoActionsMessage = () => {
  return (
    <EmptyState
      className="py-8"
      Icon={MagnifyingGlassIcon}
      primaryMessage="No actions found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
