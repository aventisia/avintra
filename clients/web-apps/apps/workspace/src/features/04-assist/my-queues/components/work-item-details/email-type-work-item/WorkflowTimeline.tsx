import { NoContentMessage } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  CheckCircle2,
  CornerUpRight,
  MessageSquare,
  Pencil,
  // PlusCircle,
} from "lucide-react";
import { useState } from "react";

import MarkdownContainer from "@/components/markdown/MarkdownContainer";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";

import { QueueTransactionEventDto } from "../../../dtos/queue-transaction-event-dto";
import { QueueTransactionEventEnum } from "../../../enums/queue-transaction-event-enum";
import {
  useFetchQueueWorkItemEvents,
  useInsertQueueWorkItemEvent,
} from "../../../hooks/useQueueTransactionEvents";

// --- Pure Helper Functions ---

const getInitials = (name?: string | null) => {
  if (!name) return "SY"; // System default
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const formatTimelineDate = (dateString: Date | string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
};

// --- Sub-Components ---

const TimelineIcon = ({ type }: { type: QueueTransactionEventEnum }) => {
  const baseStyles =
    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background ring-4 ring-background shadow-sm";

  switch (type) {
    case QueueTransactionEventEnum.StatusChange:
      // case QueueTransactionEventEnum.DescriptionUpdated:
      return (
        <div className={cn(baseStyles, "border-gray-200 text-gray-500")}>
          <Pencil className="h-3.5 w-3.5" />
        </div>
      );
    case QueueTransactionEventEnum.Closed:
      return (
        <div className={cn(baseStyles, "border-green-200 bg-green-50 text-green-600")}>
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    case QueueTransactionEventEnum.QueueTransactionRouted:
      return (
        <div className={cn(baseStyles, "border-blue-200 bg-blue-50 text-blue-600")}>
          <CornerUpRight className="h-3.5 w-3.5" />
        </div>
      );
    // case QueueTransactionEventEnum.QueueTransactionCreated:
    //   return (
    //     <div
    //       className={cn(baseStyles, "border-blue-200 bg-blue-50 text-blue-600")}
    //     >
    //       <PlusCircle className="h-3.5 w-3.5" />
    //     </div>
    //   );
    default:
      return (
        <div className={cn(baseStyles, "border-gray-200 text-gray-500")}>
          <MessageSquare className="h-3.5 w-3.5" />
        </div>
      );
  }
};

const TimelineEvent = ({ item }: { item: QueueTransactionEventDto }) => {
  const isComment = item.eventType === QueueTransactionEventEnum.CommentAdded;
  const authorName = item.createdBy || "System";

  return (
    <div className="group relative flex gap-x-5">
      {/* 1. Icon/Avatar */}
      <div className="relative flex-none">
        {isComment ? (
          <Avatar className="relative z-10 h-8 w-8 border border-primary-100">
            <AvatarFallback className="bg-primary-50 pt-0.5 text-xs font-bold text-primary">
              {getInitials(authorName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="ml-0.5">
            <TimelineIcon type={item.eventType} />
          </div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="min-w-0 flex-1 pt-0.5">
        {/* TYPE: COMMENT */}
        {item.eventType === QueueTransactionEventEnum.CommentAdded && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="cursor-pointer text-sm font-semibold hover:underline">
                  {authorName}
                </span>
                <span className="text-sm text-muted-foreground">commented</span>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatTimelineDate(item.createdOn)}
              </span>
            </div>
            <div className="bg-muted/30 hover:bg-muted/50 relative rounded-lg border px-2.5 py-1 text-sm leading-relaxed shadow-sm transition-all">
              <MarkdownViewer textValue={item.data} size="xs" />
            </div>
          </div>
        )}

        {/* TYPE: STATUS CHANGE */}
        {item.eventType === QueueTransactionEventEnum.StatusChange && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-semibold">{authorName}</span>
              <span className="text-muted-foreground">changed status to</span>
              {item.data && (
                <Badge variant="outline" className="bg-slate-200 text-slate-600">
                  {item.data}
                </Badge>
              )}
            </div>
            <span className="pl-0.5 text-xs text-muted-foreground">
              {formatTimelineDate(item.createdOn)}
            </span>
          </div>
        )}

        {/* TYPE: MOVE / ASSIGNED */}
        {item.eventType === QueueTransactionEventEnum.QueueTransactionRouted && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{authorName}</span>
              <span className="text-muted-foreground">routed the work item to</span>
              {
                <Badge variant="default" className="bg-blue-200 text-blue-700">
                  {item.data || "Queue"}
                </Badge>
              }
            </div>
            <span className="pl-0.5 text-xs text-muted-foreground">
              {formatTimelineDate(item.createdOn)}
            </span>
          </div>
        )}

        {/* TYPE: COMPLETE */}
        {item.eventType === QueueTransactionEventEnum.Closed && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="font-semibold">{authorName}</span>
              <span className="font-medium text-green-600">marked this workitem as closed</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTimelineDate(item.createdOn)}
            </span>
          </div>
        )}

        {/* FALLBACK FOR OTHER EVENTS (Created, DescriptionUpdated, etc.) */}
        {![
          QueueTransactionEventEnum.CommentAdded,
          QueueTransactionEventEnum.StatusChange,
          QueueTransactionEventEnum.QueueTransactionRouted,
          QueueTransactionEventEnum.Closed,
        ].includes(item.eventType) && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-semibold">{authorName}</span>
              <span className="text-muted-foreground">updated the item</span>
              {item.data && (
                <Badge variant="outline" className="bg-slate-200 text-slate-600">
                  {item.data}
                </Badge>
              )}
            </div>
            <span className="pl-0.5 text-xs text-muted-foreground">
              {formatTimelineDate(item.createdOn)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function WorkflowTimeline({
  workItemId,
  isCompleted,
}: {
  workItemId?: string;
  isCompleted?: boolean;
}) {
  const [commentText, setCommentText] = useState("");

  const { data: events = [], isLoading } = useFetchQueueWorkItemEvents(workItemId);

  const { mutate: addEvent, isPending } = useInsertQueueWorkItemEvent();

  // Fail safe: If no ID is passed, don't attempt to render or fetch
  if (!workItemId) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    addEvent(
      {
        id: crypto.randomUUID(),
        queueTransactionId: workItemId,
        eventType: QueueTransactionEventEnum.CommentAdded,
        data: commentText,
        createdOn: new Date().toISOString(),
      },
      { onSuccess: () => setCommentText("") },
    );
  };

  return (
    <div className="w-full max-w-4xl space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold">Activity Log</h3>
      </div>

      <div className="rounded-lg border bg-background p-6 shadow-sm">
        {isLoading ? (
          <div className="pb-6 text-sm text-muted-foreground">Loading timeline...</div>
        ) : (
          <div className="relative pb-6 pl-2">
            {events.length > 0 ? (
              <>
                <div
                  className={cn(
                    "absolute bottom-0 left-6 top-2 w-0.5 bg-gray-100 ",
                    isCompleted && "bottom-12",
                  )}
                  aria-hidden="true"
                />
                <div className="space-y-10">
                  {events.map((item) => (
                    <TimelineEvent key={item.id} item={item} />
                  ))}
                </div>
              </>
            ) : (
              <NoContentMessage primaryMessage="No activity recorded yet." />
            )}
          </div>
        )}

        {/* INPUT SECTION */}
        {!isCompleted && (
          <div className="relative flex gap-x-5 pl-2 pt-2">
            <div className="flex-none">
              <TimelineIcon type={QueueTransactionEventEnum.CommentAdded} />
            </div>

            <div className="min-w-0 flex-1 rounded-lg border p-2">
              <MarkdownContainer
                setTextValue={setCommentText}
                textValue={commentText}
                className="timeline"
              />
              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isPending}
                >
                  {isPending ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
