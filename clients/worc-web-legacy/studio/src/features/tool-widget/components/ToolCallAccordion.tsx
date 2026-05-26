import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { cn } from "@aventisia/ui/lib";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  StopCircle,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

// Execution status
export type ToolCallStatus =
  | "idle" // Waiting for user confirmation
  | "executing" // Mutation in-flight
  | "success" // Mutation resolved
  | "aborted" // User cancelled before execution
  | "stopped"; // Mutation failed / externally halted

// Status badge config
const STATUS_CONFIG = {
  idle: { label: null, icon: null, className: "" },
  executing: { label: null, icon: null, className: "" },
  success: {
    label: "Workflow Executed Successfully.",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "text-emerald-600",
  },
  aborted: {
    label: "Workflow Aborted.",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "text-red-500",
  },
  stopped: {
    label: "Workflow Stopped.",
    icon: <StopCircle className="h-3.5 w-3.5" />,
    className: "text-amber-500",
  },
} satisfies Record<
  ToolCallStatus,
  { label: string | null; icon: ReactNode; className: string }
>;

// Props
export interface ToolCallAccordionProps {
  /**
   * Display name of the tool, e.g. "gmail_send_email".
   */
  toolName: string;
  /**
   * Path to the tool icon inside the public folder.
   */
  iconSrc?: string;
  /** Current execution state — drives badge visibility and open/close default. */
  status: ToolCallStatus;
  /** Dynamic form fields rendered inside the accordion body. */
  children: ReactNode;
  /**
   * Override the initial open state.
   */
  defaultOpen?: boolean;
  className?: string;
}

// Component
export function ToolCallAccordion({
  toolName,
  iconSrc,
  status = "idle",
  children,
  defaultOpen,
  className,
}: ToolCallAccordionProps) {
  const isStatus =
    status === "success" || status === "aborted" || status === "stopped";

  const resolvedDefaultOpen =
    defaultOpen ?? (status === "idle" || status === "executing");

  const [openItem, setOpenItem] = useState<string>(
    resolvedDefaultOpen ? "tool-call" : "",
  );

  // Auto-collapse when a terminal state is reached (unless user re-opened it).
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current !== status && isStatus) {
      setOpenItem("");
    }
    prevStatus.current = status;
  }, [status, isStatus]);

  const badgeConfig = STATUS_CONFIG[status];

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={setOpenItem}
      className={cn("w-full ", className)}
    >
      <AccordionItem
        value="tool-call"
        className={cn(
          "rounded-xl border border-border bg-card shadow overflow-hidden",
          "border-b-0",
        )}
      >
        {/*  Trigger  */}
        <AccordionTrigger
          className={cn(
            "flex w-full items-center gap-2.5 px-4 py-3",
            "hover:no-underline hover:bg-muted bg-accent transition-colors",
            //for custom chevron icon
            "group [&>svg]:hidden",
          )}
        >
          {/* Icon — loaded from /public */}
          {iconSrc && (
            <img
              src={iconSrc}
              alt={toolName ?? ""}
              className="h-5 w-5 shrink-0 object-contain"
            />
          )}

          {/* Tool name in monospace */}
          <span className="text-sm font-medium  text-foreground">
            {toolName}
          </span>

          {/* Custom chevron icon */}
          <div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>

          {/* Status */}
          {isStatus && badgeConfig.label ? (
            <span
              className={cn(
                "ml-auto mr-2 flex items-center gap-1.5 text-xs font-medium",
                badgeConfig.className,
              )}
            >
              {badgeConfig.icon}
              {badgeConfig.label}
            </span>
          ) : (
            <span className="ml-auto" />
          )}
        </AccordionTrigger>

        {/*  Body  */}
        <AccordionContent className="p-2">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
