import { NoContentMessage } from "@avplatform/ui";
import { MessageSquareOff } from "lucide-react";

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
