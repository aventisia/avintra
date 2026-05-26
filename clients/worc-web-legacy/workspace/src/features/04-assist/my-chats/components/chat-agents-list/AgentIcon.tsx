import NewAgentIcon from "@/components/NewAgentIcon";

import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { cn } from "@aventisia/ui/lib";

export function AgentIcon({ active }: { active: boolean }) {
  return (
    <Avatar
      className={cn(
        "w-8 h-8 transition-colors bg-[#eeeef8]",
        active && "border border-primary",
      )}
    >
      <AvatarFallback className="bg-transparent">
        <NewAgentIcon className={cn("w-4 h-4", active && "text-primary")} />
      </AvatarFallback>
    </Avatar>
  );
}
