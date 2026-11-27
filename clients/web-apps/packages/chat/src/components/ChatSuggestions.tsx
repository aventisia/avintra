type ChatSuggestionsProps = {
  suggestions: readonly string[];
  onPick: (text: string) => void;
};

/** Suggested next messages under the latest reply; a click hands the text to `onPick`. */
export const ChatSuggestions = ({ suggestions, onPick }: ChatSuggestionsProps) => (
  <ul
    aria-label="Suggested follow-ups"
    data-chat-print-hide
    className="mx-auto flex w-full max-w-[var(--chat-column)] flex-wrap gap-2 pb-6 pt-2 duration-200 animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
  >
    {suggestions.map((suggestion) => (
      <li key={suggestion} className="min-w-0 max-w-full">
        <button
          type="button"
          onClick={() => onPick(suggestion)}
          className="inline-flex min-h-9 max-w-full items-center rounded-lg border border-line px-3.5 py-1.5 text-left text-sm font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {suggestion}
        </button>
      </li>
    ))}
  </ul>
);
