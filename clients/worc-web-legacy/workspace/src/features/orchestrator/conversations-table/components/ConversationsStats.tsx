import NewAgentIcon from "@/components/NewAgentIcon";
import NewChatIcon from "@/components/NewChatIcon";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";

import { MessageCircleMoreIcon } from "lucide-react";
import { useMemo } from "react";

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

    const uniqueAgents = new Set(data.map((x) => x.firstName).filter(Boolean));

    const totalExchanges = data.reduce(
      (acc, x) => acc + (x.totalExchange ?? 0),
      0,
    );
    return {
      conversations,
      agents: uniqueAgents.size,
      totalExchanges,
    };
  }, [data]);

  return (
    <div className="my-4 grid grid-cols-3 gap-3">
      {/* Total conversations */}
      <StatsCard
        title="Total Conversations"
        mainText={stats.conversations}
        icon={<NewChatIcon className=" text-primary h-9 w-9" />}
      />

      {/* Active Agents */}
      <StatsCard
        title="Total Agents"
        mainText={stats.agents}
        icon={<NewAgentIcon className="h-9 w-9 text-primary stroke-primary " />}
      />

      {/* Total exchanges */}
      <StatsCard
        title="Total Exchanges"
        mainText={stats.totalExchanges}
        icon={
          <MessageCircleMoreIcon stroke="var(--primary)" className="h-9 w-9" />
        }
      />
    </div>
  );
};
