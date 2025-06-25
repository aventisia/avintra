import { NoContentMessage } from "@aventisia/ui";
import { Workflow } from "lucide-react";

/**
 * Renders a component that displays a message when there are no Agents.
 */
export const AANoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={Workflow}
      primaryMessage="No Agents Found"
    />
  );
};
