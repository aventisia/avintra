import { cn } from "@avplatform/ui/lib";

interface HighlightedTextProps {
  text: string;
  query: string;
  markClassName?: string;
}

/**
 * Emphasises the first case-insensitive match of the query inside the text.
 */
export const HighlightedText = ({ text, query, markClassName }: HighlightedTextProps) => {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className={cn("bg-transparent font-semibold text-inherit", markClassName)}>
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
};
