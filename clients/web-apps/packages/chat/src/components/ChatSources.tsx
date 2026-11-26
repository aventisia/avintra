import type { ChatSource } from "@avplatform/assistant-chat";
import { GlobeIcon } from "@phosphor-icons/react";

/** Row of site chips for the pages a reply was based on. */
export const ChatSources = ({ sources }: { sources: readonly ChatSource[] }) => (
  <section aria-label="Sources" className="mt-3 mb-1">
    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Sources</p>
    <ul className="flex flex-wrap gap-2">
      {sources.map((source, index) => (
        <li key={source.url} className="min-w-0 max-w-full">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="shrink-0 text-muted-foreground">{index + 1}</span>
            <span className="truncate font-medium">{source.title}</span>
            <span className="hidden shrink-0 text-muted-foreground sm:inline">{source.domain}</span>
          </a>
        </li>
      ))}
    </ul>
  </section>
);
