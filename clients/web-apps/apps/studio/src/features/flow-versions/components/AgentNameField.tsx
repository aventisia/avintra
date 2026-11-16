import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

const NAME_PLACEHOLDER = "Agent name";

type AgentNameFieldProps = {
  onRename: (name: string) => void;
  className?: string;
};

/**
 * Agent name as inline-editable text that keeps the header's typography and grows with its
 * value up to the width its container allows. An empty name is flagged while typing and
 * restored on blur.
 */
export const AgentNameField = ({ onRename, className }: AgentNameFieldProps) => {
  const savedName = useCurrentFlowStore((state) => state.currentFlow.name);
  const [name, setName] = useState(savedName);
  const isCancellingRef = useRef(false);
  const isEmpty = !name.trim();

  useEffect(() => setName(savedName), [savedName]);

  const commit = () => {
    const trimmed = name.trim();
    if (isCancellingRef.current || !trimmed) {
      isCancellingRef.current = false;
      setName(savedName);
      return;
    }
    if (trimmed !== savedName) onRename(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") isCancellingRef.current = true;
    if (e.key === "Escape" || e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <span className="inline-grid min-w-0 grid-cols-[minmax(0,max-content)]">
      <span
        aria-hidden="true"
        className={cn(
          "invisible col-start-1 row-start-1 overflow-hidden whitespace-pre px-1",
          className,
        )}
      >
        {name || NAME_PLACEHOLDER}
      </span>
      <Tooltip content={isEmpty ? "Give the agent a name" : "Rename"}>
        <input
          aria-label="Agent name"
          aria-invalid={isEmpty}
          placeholder={NAME_PLACEHOLDER}
          value={name}
          spellCheck={false}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={cn(
            "col-start-1 row-start-1 w-0 min-w-full cursor-text truncate rounded bg-transparent px-1 transition-shadow placeholder:text-muted-foreground",
            "hover:ring-1 hover:ring-inset hover:ring-line-strong focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus",
            isEmpty && "ring-1 ring-bad focus-visible:ring-bad",
            className,
          )}
        />
      </Tooltip>
    </span>
  );
};
