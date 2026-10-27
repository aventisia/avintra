import { NoContentMessage } from "@avplatform/ui";

import NewAgentIcon from "@/components/NewAgentIcon";

export function NoAgentsAvailable({ includeChat = true }: { includeChat?: boolean }) {
  return (
    <NoContentMessage
      className="h-[calc(100vh-4*var(--header-height))]"
      Icon={NewAgentIcon}
      primaryMessage="No agents assigned"
      secondaryMessage={`You don't have any ${includeChat ? "chat " : ""}agents assigned to you. Please contact your administrator to request access.`}
    />
  );
}
