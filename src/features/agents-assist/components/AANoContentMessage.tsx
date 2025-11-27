import { NoContentMessage } from "@aventisia/ui";
import { BotIcon } from "lucide-react";

/**
 * Renders a component that displays a message when there are no Agents.
 */
export const AANoContentMessage = () => {
  return (
    <NoContentMessage
      className="mt-5"
      Icon={BotIcon}
      primaryMessage="No Agents Found"
    />
  );
};
