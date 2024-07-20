import { MessageSquareOff } from "lucide-react";
import { NoContentMessage } from "@/react-toolkit/components/ui";

/**
 * Renders a component that displays a message when there are no comments.
 */
export const FCPNoContentMessage = () => {
  return (
    <NoContentMessage
      Icon={MessageSquareOff}
      primaryMessage="No comments yet"
      secondaryMessage="Feel free to leave your feedback"
    />
  );
};
