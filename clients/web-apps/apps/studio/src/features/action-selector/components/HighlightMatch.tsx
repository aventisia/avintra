export const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  const start = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (start < 0) return <>{text}</>;
  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-[3px] bg-primary/15 px-px text-primary-text">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
};
