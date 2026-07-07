import { Avatar, AvatarFallback, AvatarImage } from "@aventisia/ui/avatar";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import {
  ArrowRight,
  CheckCircle2,
  // Switched to generic ArrowRight for cleaner "flow"
  CornerUpRight,
  // MessageSquare,
  Pencil,
} from "lucide-react";

import MarkdownContainer from "@/components/markdown/MarkdownContainer";

// --- Types ---

type EventType = "comment" | "status_change" | "mark_complete" | "move";

interface TimelineUser {
  name: string;
  avatar?: string;
  initials: string;
}

interface TimelineItem {
  id: string;
  type: EventType;
  user: TimelineUser;
  timestamp: string;
  content?: string;
  meta?: {
    from?: string;
    to?: string;
    queueName?: string;
  };
}

// --- Sample Data ---

const WORKFLOW_HISTORY: TimelineItem[] = [
  {
    id: "1",
    type: "comment",
    user: { name: "Yordan Iliev", initials: "YI" },
    timestamp: "28 Apr, 10:23 AM",
    content:
      "There was a typo in the previous deployment configuration. I think we need to double check the environment variables before the next build.",
  },
  {
    id: "2",
    type: "status_change",
    user: { name: "Alex B. Chen", initials: "AB" },
    timestamp: "28 Apr, 2:00 PM",
    meta: { from: "To Do", to: "In Progress" },
  },
  {
    id: "3",
    type: "move",
    user: { name: "Sarah Miller", initials: "SM" },
    timestamp: "29 Apr, 9:15 AM",
    meta: { queueName: "QA Validation" },
  },
  {
    id: "4",
    type: "mark_complete",
    user: { name: "System Admin", initials: "SA" },
    timestamp: "3 weeks ago",
  },
  {
    id: "5",
    type: "comment",
    user: { name: "Yordan Iliev", initials: "YI" },
    timestamp: "Today, 11:30 AM",
    content: "Thanks for moving this forward! Looks good to go.",
  },
];

// --- Sub-Components ---

const TimelineIcon = ({ type }: { type: EventType }) => {
  const baseStyles =
    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background ring-4 ring-background shadow-sm";

  switch (type) {
    case "status_change":
      return (
        <div className={cn(baseStyles, "border-gray-200 text-gray-500")}>
          <Pencil className="h-3.5 w-3.5" />
        </div>
      );
    case "mark_complete":
      return (
        <div
          className={cn(
            baseStyles,
            "border-green-200 bg-green-50 text-green-600",
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    case "move":
      return (
        <div
          className={cn(baseStyles, "border-blue-200 bg-blue-50 text-blue-600")}
        >
          <CornerUpRight className="h-3.5 w-3.5" />
        </div>
      );
    default:
      return null;
  }
};

// --- Main Component ---

const WorkflowTimeline = () => {
  return (
    <div className="w-full max-w-4xl space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">Activity Log</h3>
      </div>

      <div className="rounded-lg border bg-background p-6 shadow-sm">
        {/* Container for History
            pb-6: Ensures the line extends just enough to touch the comment section
        */}
        <div className="relative pb-6 pl-2">
          {/* Vertical Guide Line */}
          <div
            className="absolute bottom-0 left-6 top-2 w-0.5 bg-gray-100"
            aria-hidden="true"
          />

          <div className="space-y-10">
            {WORKFLOW_HISTORY.map((item) => (
              <div key={item.id} className="group relative flex gap-x-5">
                {/* 1. The Timeline Node (Icon/Avatar) */}
                <div className="relative flex-none">
                  {item.type === "comment" ? (
                    <Avatar className="relative z-10 h-8 w-8 border border-primary-100">
                      <AvatarImage src={item.user.avatar} />
                      <AvatarFallback className="bg-primary-50 pt-0.5 text-xs font-bold text-primary">
                        {item.user.initials}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="ml-0.5">
                      {" "}
                      {/* Slight offset to center icon on line */}
                      <TimelineIcon type={item.type} />
                    </div>
                  )}
                </div>

                {/* 2. The Content Area */}
                <div className="min-w-0 flex-1 pt-0.5">
                  {/* TYPE: COMMENT */}
                  {item.type === "comment" && (
                    <div className="flex flex-col gap-2">
                      {/* Meta Header */}
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                          <span className="cursor-pointer text-sm font-semibold hover:underline">
                            {item.user.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            commented
                          </span>
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* Comment Bubble */}
                      <div className="bg-muted/30 hover:bg-muted/50 relative rounded-lg border px-4 py-3 text-sm leading-relaxed shadow-sm transition-all">
                        {/* Optional: Little caret pointing to avatar */}
                        <div className="bg-muted/30 absolute -left-1.5 top-3 h-3 w-3 rotate-45 border-l border-t content-['']" />
                        <span className="relative z-10">{item.content}</span>
                      </div>
                    </div>
                  )}

                  {/* TYPE: STATUS CHANGE */}
                  {item.type === "status_change" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-semibold">{item.user.name}</span>
                        <span className="text-muted-foreground">
                          changed status
                        </span>

                        {/* Status Flow Visualization */}

                        <Badge
                          variant="outline"
                          className="bg-slate-200 text-slate-600"
                        >
                          {item.meta?.from}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                        <Badge
                          variant="outline"
                          className="bg-slate-200 text-slate-600"
                        >
                          {item.meta?.to}
                        </Badge>
                      </div>
                      <span className="pl-0.5 text-xs text-muted-foreground">
                        {item.timestamp}
                      </span>
                    </div>
                  )}

                  {/* TYPE: MOVE */}
                  {item.type === "move" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{item.user.name}</span>
                        <span className="text-muted-foreground">moved to</span>
                        <Badge
                          variant="default"
                          className="bg-blue-200 text-blue-700"
                        >
                          {item.meta?.queueName}
                        </Badge>
                      </div>{" "}
                      <span className="pl-0.5 text-xs text-muted-foreground">
                        {item.timestamp}
                      </span>
                    </div>
                  )}

                  {/* TYPE: COMPLETE */}
                  {item.type === "mark_complete" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 py-1 text-sm">
                        <span className="font-semibold">{item.user.name}</span>
                        <span className="font-medium text-green-600">
                          marked this workitem as completed
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {item.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INPUT SECTION
            The line stops exactly above this avatar.
        */}
        <div className="relative flex gap-x-5 pl-2 pt-2">
          {/* Current User Avatar */}
          <div className="flex-none">
            <Avatar className="relative z-10 h-8 w-8 border border-primary-100">
              <AvatarImage src={""} />
              <AvatarFallback className="bg-primary-50 pt-0.5 text-xs font-bold text-primary">
                VB
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Editor Area */}
          <div className="min-w-0 flex-1 border rounded-lg p-2">
            <MarkdownContainer
              setTextValue={() => {}}
              textValue=""
              className="timeline"
            ></MarkdownContainer>

            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="default">
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTimeline;
