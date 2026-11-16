import { ArrowRightIcon, CompassIcon } from "@phosphor-icons/react";
import { useContext } from "react";

import { ChatIntentContext } from "../constants/chat-intent.constant";
import { findDestination } from "../utils/chat-intent.util";

/** A page the assistant suggests, opened with one click; unknown routes render nothing. */
export const ChatDestination = ({ args }: { args: unknown }) => {
  const { destinations, onNavigate } = useContext(ChatIntentContext);
  const destination = findDestination(args, destinations);
  if (!destination || !onNavigate) return null;
  const Icon = destination.icon ?? CompassIcon;

  return (
    <button
      type="button"
      aria-label={`Open ${destination.label} in ${destination.section}`}
      onClick={() => onNavigate(destination.route)}
      className="group/destination my-3 flex w-full items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3 text-left shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(0_0_0/0.2)] transition-colors duration-200 animate-in fade-in-0 slide-in-from-bottom-1 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:animate-none dark:bg-fill/40"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-muted-foreground">
          {destination.section}
        </span>
        <span className="block truncate text-[0.9375rem] font-medium leading-6 text-ink">
          {destination.label}
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-2 transition-colors group-hover/destination:text-ink">
        Open
        <ArrowRightIcon
          weight="bold"
          className="size-3.5 transition-transform group-hover/destination:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
    </button>
  );
};
