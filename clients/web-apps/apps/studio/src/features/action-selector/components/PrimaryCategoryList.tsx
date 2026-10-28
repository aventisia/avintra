import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { PrimaryCategory } from "./PrimaryCategory";

interface PrimaryCategoryListProps {
  inputRef: React.RefObject<HTMLInputElement>;
  firstItemRef: React.MutableRefObject<HTMLButtonElement | null>;
}

export const PrimaryCategoryList = ({ inputRef, firstItemRef }: PrimaryCategoryListProps) => {
  const { actionSelectorData, setPrimaryCategoryLabel } = useNodeSelectorStore(
    useShallow((state) => ({
      actionSelectorData: state.actionSelectorData,
      setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
    })),
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const gridRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    gridRefs.current[activeIndex]?.focus();
  }, [activeIndex, inputRef]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const totalItems = actionSelectorData.length;
    const columns = 2;
    const col = index % columns;
    const row = Math.floor(index / columns);

    let nextIndex = index;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (col < columns - 1 && index + 1 < totalItems) nextIndex = index + 1;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (col > 0) nextIndex = index - 1;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (index + columns < totalItems) {
        nextIndex = index + columns;
      } else if (row === Math.floor((totalItems - 1) / columns) - 1) {
        nextIndex = totalItems - 1;
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (row === 0) {
        inputRef.current?.focus();
        return;
      } else {
        nextIndex = index - columns;
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (actionSelectorData[index].disabled) return;
      setPrimaryCategoryLabel(actionSelectorData[index].label);
      return;
    }

    if (nextIndex !== index) {
      setActiveIndex(nextIndex);
      gridRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <ScrollArea className="h-full bg-surface p-3">
      <div className="grid grid-cols-2 gap-3 pb-4" role="grid" aria-label="Primary Categories">
        {actionSelectorData.map((item, index) => {
          const isDisabled = item.disabled;
          return (
            <button
              key={item.label}
              ref={(el) => {
                gridRefs.current[index] = el;
                if (index === 0) firstItemRef.current = el;
              }}
              role="gridcell"
              tabIndex={isDisabled ? -1 : activeIndex === index ? 0 : -1}
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                setPrimaryCategoryLabel(item.label);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => !isDisabled && setActiveIndex(index)}
              className={cn(
                "group flex h-44 w-full flex-col justify-between rounded-lg border p-4 text-left text-ink outline-none transition-colors",
                isDisabled
                  ? "cursor-not-allowed border-line bg-sunken opacity-70"
                  : "cursor-pointer border-line bg-surface hover:border-line-strong hover:bg-hover focus-visible:shadow-focus",
              )}
              aria-label={`Select ${item.label}`}
            >
              <PrimaryCategory data={item} />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
