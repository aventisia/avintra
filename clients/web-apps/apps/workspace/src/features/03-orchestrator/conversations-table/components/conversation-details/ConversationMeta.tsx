import { ScrollArea } from "@avplatform/ui/scroll";
import { format } from "date-fns";

import { AdminConversationDto } from "../../dtos/conversations-table-dto";

export default function ConversationMeta({ data }: { data: AdminConversationDto }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6 text-sm">
        {/* Conversation Info */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Conversation</p>

          <div className="space-y-1">
            <p className="truncate font-mono text-xs">{data.id}</p>

            <p className="font-mono text-xs text-muted-foreground">
              {format(new Date(data.timestamp), "dd MMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">User</p>

          <div className="space-y-1">
            <p className="font-medium">
              {data.firstName} {data.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{data?.username}</p>
          </div>
        </div>

        {/* Flow Info */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Agent</p>

          <div className="space-y-1">
            <p className="font-medium">{data.flowName}</p>
            <p className="text-xs text-muted-foreground">Version {data.versionNumber}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Stats</p>

          <div className="space-y-1">
            <p>
              Exchanges:{" "}
              <span className="font-mono font-medium tabular-nums">{data.totalExchange ?? 0}</span>
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
