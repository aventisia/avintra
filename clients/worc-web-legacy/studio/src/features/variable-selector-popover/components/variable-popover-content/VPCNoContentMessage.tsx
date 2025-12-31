import { NoContentMessage } from "@aventisia/ui";
import { Workflow } from "lucide-react";

/**
 * Renders a component that displays a message when there are no flows.
 */
export const VPCNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={Workflow}
      primaryMessage="No Variables found"
      secondaryMessage="Try adding a new variable."
    />
  );
};
