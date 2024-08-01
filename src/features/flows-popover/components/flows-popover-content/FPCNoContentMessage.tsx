import { NoContentMessage } from "@/react-toolkit/ui/custom/NoContentMessage";
import { Workflow } from "lucide-react";

/**
 * Renders a component that displays a message when there are no flows.
 */
export const FPCNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-4"
      Icon={Workflow}
      primaryMessage="No flows found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
