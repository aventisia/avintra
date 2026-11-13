import { AutosizeTextarea } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useUpdateCurrentAgent } from "../../hooks/useUpdateCurrentAgent.hook";
import { SaveStatusIndicator } from "../SaveStatusIndicator";

const SUBMIT_MODIFIER = navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl";

const Key = ({ children }: { children: string }) => (
  <kbd className="rounded border border-line bg-surface px-1 font-sans text-[11px] leading-4 text-ink-2">
    {children}
  </kbd>
);

/**
 * Inline-editable agent description; the header trigger above the panel carries the name.
 * While editing, a hint row shows the save and cancel keys, then the save status.
 */
export const AgentDescription = () => {
  const savedDescription = useCurrentFlowStore((state) => state.currentFlow.description ?? "");
  const { save, status } = useUpdateCurrentAgent();
  const [description, setDescription] = useState(savedDescription);
  const [isEditing, setIsEditing] = useState(false);
  const isCancellingRef = useRef(false);

  useEffect(() => setDescription(savedDescription), [savedDescription]);

  const commit = () => {
    setIsEditing(false);
    if (isCancellingRef.current) {
      isCancellingRef.current = false;
      setDescription(savedDescription);
      return;
    }
    const trimmed = description.trim();
    if (trimmed !== savedDescription) save({ description: trimmed });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") isCancellingRef.current = true;
    if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <section className="px-4 pt-3">
      <AutosizeTextarea
        aria-label="Agent description"
        placeholder="Describe what this agent does and when it runs"
        rows={1}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        minHeight={32}
        maxHeight={160}
        size="sm"
        className={cn(
          "-mx-2 w-[calc(100%+1rem)] rounded-md border border-transparent bg-transparent px-2 py-1.5 text-body text-ink-2 transition-colors placeholder:text-muted-foreground",
          "hover:bg-surface/60 focus-visible:border-focus focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28]",
        )}
      />
      <div className="flex h-5 items-center justify-between text-hint text-muted-foreground">
        {isEditing ? (
          <span className="flex items-center gap-1 duration-150 animate-in fade-in-0">
            <Key>{SUBMIT_MODIFIER}</Key>
            <Key>↵</Key>
            <span className="ml-0.5 mr-2">to save</span>
            <Key>Esc</Key>
            <span className="ml-0.5">to cancel</span>
          </span>
        ) : (
          <span />
        )}
        <SaveStatusIndicator status={status} showLabel />
      </div>
    </section>
  );
};
