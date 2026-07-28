import { NoContentMessage } from "@avplatform/ui";
import { Workflow } from "lucide-react";

/**
 * Renders a component that displays a message when there are no flows.
 */
export const FPCNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={Workflow}
      primaryMessage="No flows found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
