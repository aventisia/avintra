import { NoContentMessage } from "@/react-toolkit/ui/custom/NoContentMessage";
import { TextSearch } from "lucide-react";

/**
 * Renders a message to display when no nodes are found.
 */
export const NSNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={TextSearch}
      primaryMessage="No activities found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
