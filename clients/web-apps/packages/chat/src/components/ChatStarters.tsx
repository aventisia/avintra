import { cn } from "@avplatform/ui/lib";
import { type ComponentType, useId, useState } from "react";

/** A verb offered on an empty thread, with the example prompts it reveals. */
export type ChatStarterGroup = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  prompts: readonly string[];
};

type ChatStartersProps = {
  groups: readonly ChatStarterGroup[];
  onPick: (prompt: string) => void;
};

/** Verb chips under the empty composer; a chip toggles its example prompts. */
export const ChatStarters = ({ groups, onPick }: ChatStartersProps) => {
  const [activeLabel, setActiveLabel] = useState<string>();
  const listId = useId();
  const active = groups.find((group) => group.label === activeLabel);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {groups.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            aria-pressed={label === activeLabel}
            aria-controls={label === activeLabel ? listId : undefined}
            onClick={() => setActiveLabel(label === activeLabel ? undefined : label)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              label === activeLabel
                ? "border-line-strong bg-sunken text-ink dark:bg-fill"
                : "border-line text-ink-2 hover:bg-hover hover:text-ink",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      {active && (
        <ul
          key={active.label}
          id={listId}
          aria-label={`${active.label} examples`}
          className="divide-y divide-line duration-200 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none"
        >
          {active.prompts.map((prompt) => (
            <li key={prompt}>
              <button
                type="button"
                onClick={() => onPick(prompt)}
                className="my-0.5 w-full rounded-lg px-3 py-2.5 text-left text-[0.9375rem] leading-6 text-ink-2 transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
