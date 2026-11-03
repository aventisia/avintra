import { EmptyState } from "@avplatform/ui";
import { FlowArrowIcon } from "@phosphor-icons/react";

/**
 * Renders a component that displays a message when there are no flows.
 */
export const FPCNoContentMessage = () => {
  return (
    <EmptyState
      className="-mt-5"
      Icon={FlowArrowIcon}
      primaryMessage="No flows found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
