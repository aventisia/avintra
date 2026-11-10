import { FlowArrowIcon } from "@phosphor-icons/react";

import { parseBlueprint } from "../utils/chat-intent.util";

/** The plan the assistant proposes to build, as numbered steps; malformed data renders nothing. */
export const ChatBlueprint = ({ data }: { data: unknown }) => {
  const blueprint = parseBlueprint(data);
  if (!blueprint) return null;

  return (
    <section
      aria-label={`Blueprint: ${blueprint.title}`}
      className="my-3 rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(0_0_0/0.2)] duration-200 animate-in fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none dark:bg-fill/40"
    >
      <div className="flex items-start gap-3 border-b border-line px-4 py-3.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FlowArrowIcon weight="bold" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Blueprint</p>
          <h3 className="text-[0.9375rem] font-medium leading-6 text-ink">{blueprint.title}</h3>
          {blueprint.summary && (
            <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{blueprint.summary}</p>
          )}
        </div>
      </div>
      <ol className="px-4 py-3.5">
        {blueprint.steps.map((step, index) => (
          <li
            key={`${index}-${step.title}`}
            className="relative flex gap-3 pb-4 before:absolute before:bottom-0 before:left-3 before:top-7 before:w-px before:bg-line last:pb-0 last:before:hidden"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-xs font-medium tabular-nums text-ink-2">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium leading-5 text-ink">{step.title}</p>
              {step.detail && (
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
