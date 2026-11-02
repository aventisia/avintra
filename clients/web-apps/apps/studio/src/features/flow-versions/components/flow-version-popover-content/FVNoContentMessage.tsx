import { EmptyState } from "@avplatform/ui";
import { Workflow } from "lucide-react";

/**
 * Renders a component that displays a message when there are no flow versions.
 */
export const FVNoContentMessage = () => {
  return (
    <EmptyState
      className="-mt-5"
      Icon={Workflow}
      primaryMessage="No flow versions found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
