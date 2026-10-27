import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { cn } from "@avplatform/ui/lib";

import NewAgentIcon from "@/components/NewAgentIcon";

export function AgentIcon({ active }: { active: boolean }) {
  return (
    <Avatar
      className={cn("w-8 h-8 transition-colors bg-sunken", active && "border border-primary")}
    >
      <AvatarFallback className="bg-transparent">
        <NewAgentIcon className={cn("w-4 h-4", active && "text-primary")} />
      </AvatarFallback>
    </Avatar>
  );
}
