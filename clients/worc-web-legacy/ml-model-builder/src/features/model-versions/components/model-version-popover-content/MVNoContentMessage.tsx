import { NoContentMessage } from "@aventisia/ui";
import { Workflow } from "lucide-react";

/**
 * Renders a component that displays a message when there are no model versions.
 */
export const MVNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={Workflow}
      primaryMessage="No versions found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
