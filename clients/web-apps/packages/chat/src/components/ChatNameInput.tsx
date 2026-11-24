import { Input } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { useRef, useState } from "react";

type ChatNameInputProps = {
  initialName?: string;
  label: string;
  maxLength: number;
  placeholder?: string;
  className?: string;
  onDone: (name: string | null) => void;
};

/** Edits a chat or project name in place; Enter or blur saves, Escape cancels, and an empty name counts as cancel. */
export const ChatNameInput = ({
  initialName = "",
  label,
  maxLength,
  placeholder,
  className,
  onDone,
}: ChatNameInputProps) => {
  const [value, setValue] = useState(initialName);
  const doneRef = useRef(false);

  // IMPORTANT NOTE: Enter and the blur that follows both fire for one edit, so only the first one counts.
  const finish = (name: string | null) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(name);
  };

  return (
    <Input
      autoFocus
      value={value}
      maxLength={maxLength}
      aria-label={label}
      placeholder={placeholder}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") finish(value.trim() || null);
        if (event.key === "Escape") finish(null);
      }}
      onBlur={() => finish(value.trim() || null)}
      className={cn("h-9 rounded-lg px-2 text-sm", className)}
    />
  );
};
