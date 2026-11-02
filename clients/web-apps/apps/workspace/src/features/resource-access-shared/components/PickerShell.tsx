import { cn } from "@avplatform/ui/lib";
import { LoaderCircle, Search } from "lucide-react";
import { Popover } from "radix-ui";
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Kbd } from "@/components/Kbd";

type PickerOption = {
  key: string;
  content: ReactNode;
  onPick: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
};

type PickerShellProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  isFetching: boolean;
  inputLabel: string;
  placeholder: string;
  listLabel: string;
  header?: ReactNode;
  empty: ReactNode;
  options: PickerOption[];
  footer: ReactNode;
};

/**
 * Search combobox with a popover listbox, shared by the sharing and agent access pickers.
 */
export const PickerShell = ({
  isOpen,
  onOpenChange,
  query,
  onQueryChange,
  isFetching,
  inputLabel,
  placeholder,
  listLabel,
  header,
  empty,
  options,
  footer,
}: PickerShellProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const safeIndex = options.length > 0 ? Math.min(activeIndex, options.length - 1) : -1;
  const optionId = useCallback((index: number) => `${listId}-option-${index}`, [listId]);

  useEffect(() => {
    if (isOpen && safeIndex >= 0) {
      document.getElementById(optionId(safeIndex))?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, optionId, safeIndex]);

  const pick = (option: PickerOption) => {
    if (!option.isDisabled) option.onPick();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        onOpenChange(true);
        return;
      }
      if (options.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((safeIndex + step + options.length) % options.length);
    } else if (event.key === "Enter" && isOpen && safeIndex >= 0) {
      event.preventDefault();
      pick(options[safeIndex]);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Anchor asChild>
        <div
          ref={anchorRef}
          className="relative flex h-11 items-center rounded-md bg-surface ring-1 ring-line-strong transition-shadow focus-within:shadow-focus focus-within:ring-focus"
        >
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <input
            data-autofocus
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={isOpen && safeIndex >= 0 ? optionId(safeIndex) : undefined}
            aria-label={inputLabel}
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setActiveIndex(0);
              onOpenChange(true);
            }}
            onClick={() => onOpenChange(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-full w-full bg-transparent pl-10 pr-12 text-[13.5px] text-ink outline-none placeholder:text-muted-foreground"
          />
          <span className="pointer-events-none absolute right-3 flex items-center text-muted-foreground">
            {isOpen && isFetching ? <LoaderCircle className="size-4 animate-spin" /> : <Kbd>↓</Kbd>}
          </span>
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          // IMPORTANT NOTE: Radix dialog scroll lock swallows wheel events on portaled popover content.
          onWheel={(event) => event.stopPropagation()}
          onInteractOutside={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg bg-popover shadow-pop ring-1 ring-line data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1"
        >
          {header}

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={listLabel}
            className="max-h-[17rem] overflow-y-auto overscroll-contain p-1.5"
          >
            {options.length === 0
              ? empty
              : options.map((option, index) => (
                  <li
                    key={option.key}
                    id={optionId(index)}
                    role="option"
                    aria-selected={option.isSelected}
                    aria-disabled={option.isDisabled}
                    onPointerMove={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pick(option)}
                    className={cn(
                      "flex cursor-pointer select-none items-center gap-3 rounded-md px-2 py-2 transition-colors",
                      index === safeIndex && "bg-hover",
                      option.isDisabled && "cursor-default",
                      option.className,
                    )}
                  >
                    {option.content}
                  </li>
                ))}
          </ul>

          <div className="flex items-center gap-3 border-t border-line bg-sunken px-3.5 py-2 text-[11px] text-muted-foreground">
            {footer}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
