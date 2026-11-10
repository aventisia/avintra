import { StatsCard } from "@avplatform/ui/cards";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import NewAgentIcon from "@/components/NewAgentIcon";
import NewChatIcon from "@/components/NewChatIcon";

import { AdminConversationDto } from "../dtos/conversations-table-dto";

interface StatsProps {
  data: AdminConversationDto[];
}

export const ConversationsStats = ({ data }: StatsProps) => {
  const stats = useMemo(() => {
    if (!data?.length) {
      return {
        conversations: 0,
        agents: 0,
        totalExchanges: 0,
      };
    }

    const conversations = data.length;

    const uniqueAgents = new Set(data.map((x) => x.flowVersionId).filter(Boolean));

    const totalExchanges = data.reduce((acc, x) => acc + (x.totalExchange ?? 0), 0);
    return {
      conversations,
      agents: uniqueAgents.size,
      totalExchanges,
    };
  }, [data]);

  return (
    <div className="mb-2 grid grid-cols-3 gap-4">
      {/* Total conversations */}
      <StatsCard
        icon={<NewChatIcon className="  size-7" />}
        title="Total conversations"
        content={stats.conversations}
      />

      {/* Active Agents */}
      <StatsCard
        icon={<NewAgentIcon className="size-7  " />}
        title="Total agents"
        content={stats.agents}
      />

      {/* Total exchanges */}
      <StatsCard
        icon={<ChatCircleDotsIcon className="size-7" />}
        title="Total exchanges"
        content={stats.totalExchanges}
      />
    </div>
  );
};
