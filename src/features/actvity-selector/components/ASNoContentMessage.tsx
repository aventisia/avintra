import { NoContentMessage } from "@/react-toolkit/components/ui";
import { TextSearch } from "lucide-react";

/**
 * Renders a message to display when no activities are found.
 */
export const ASNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={TextSearch}
      primaryMessage="No activities found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
