export type HighlightedTextProps = {
  text: string;
  query: string;
};

/**
 * Marks the first case-insensitive match of the trimmed query inside the text.
 */
export const HighlightedText = ({ text, query }: HighlightedTextProps) => {
  const term = query.trim();
  const index = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[3px] bg-selected text-ink [box-decoration-break:clone]">
        {text.slice(index, index + term.length)}
      </mark>
      {text.slice(index + term.length)}
    </>
  );
};
