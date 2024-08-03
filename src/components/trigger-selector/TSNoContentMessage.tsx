import { NoContentMessage } from "@/react-toolkit/ui/custom/NoContentMessage";
import { TextSearch } from "lucide-react";

/**
 * Renders a message to display when no triggers found.
 */
export const TSNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-5"
      Icon={TextSearch}
      primaryMessage="No triggers found"
      secondaryMessage="Try adjusting your search or filter criteria"
    />
  );
};
