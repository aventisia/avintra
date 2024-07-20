import { Workflow } from "lucide-react";
import { NoContentMessage } from "@/react-toolkit/components/ui";

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
