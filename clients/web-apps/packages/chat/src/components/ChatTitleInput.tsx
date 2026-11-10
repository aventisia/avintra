import { Input } from "@avplatform/ui";
import { useRef, useState } from "react";

/** Edits a chat title in place; Enter or blur saves, Escape cancels, and an empty title counts as cancel. */
export const ChatTitleInput = ({
  title,
  onDone,
}: {
  title: string;
  onDone: (title: string | null) => void;
}) => {
  const [value, setValue] = useState(title);
  const doneRef = useRef(false);
  const finish = (next: string | null) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(next);
  };

  return (
    <Input
      autoFocus
      value={value}
      maxLength={200}
      aria-label="Chat title"
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") finish(value.trim() || null);
        if (event.key === "Escape") finish(null);
      }}
      onBlur={() => finish(value.trim() || null)}
      className="h-9 rounded-lg px-2 text-sm"
    />
  );
};
