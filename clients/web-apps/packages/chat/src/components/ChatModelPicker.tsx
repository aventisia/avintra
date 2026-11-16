import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon, SparkleIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useId, useMemo, useRef, useState } from "react";

/** A model offered in the composer's model picker. */
export type ChatModelOption = {
  key: string;
  label: string;
  /** Shown under the label when it differs from it, such as the raw model ID. */
  detail?: string;
};

/** A provider's models in the composer's model picker. */
export type ChatModelGroup = {
  label: string;
  models: readonly ChatModelOption[];
};

export type ChatModelPickerProps = {
  groups: readonly ChatModelGroup[];
  /** Selected model key, or null for Auto (the workspace default). */
  value: string | null;
  onChange: (key: string | null) => void;
};

const AUTO = "auto";

type Option = ChatModelOption & { groupLabel: string | null };

const AUTO_OPTION: Option = {
  key: AUTO,
  label: "Auto",
  detail: "Your workspace default",
  groupLabel: null,
};

/** Composer chip that picks the model for the next message. */
export const ChatModelPicker = ({ groups, value, onChange }: ChatModelPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState<string>(value ?? AUTO);
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allModels = useMemo(() => groups.flatMap((group) => group.models), [groups]);
  const selected = allModels.find((model) => model.key === value);
  const needle = query.trim().toLowerCase();

  const options = useMemo<Option[]>(() => {
    const matches = (model: ChatModelOption) =>
      !needle ||
      model.label.toLowerCase().includes(needle) ||
      (model.detail?.toLowerCase().includes(needle) ?? false);
    return [
      ...(needle ? [] : [AUTO_OPTION]),
      ...groups.flatMap((group) =>
        group.models.filter(matches).map((model) => ({ ...model, groupLabel: group.label })),
      ),
    ];
  }, [groups, needle]);

  const activeOption = options.find((option) => option.key === activeKey) ?? options[0];
  const optionId = (key: string) => `${listId}-${key.replace(/[^\w-]/g, "_")}`;

  const openChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setQuery("");
      setActiveKey(value ?? AUTO);
    }
  };

  const pick = (key: string) => {
    onChange(key === AUTO ? null : key);
    setIsOpen(false);
  };

  const scrollIntoView = (key: string) =>
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(key))}`)
      ?.scrollIntoView({ block: "nearest" });

  const navigate = (event: KeyboardEvent<HTMLInputElement>) => {
    if (options.length === 0) return;
    const index = activeOption ? options.indexOf(activeOption) : -1;
    const nextIndex = {
      ArrowDown: Math.min(options.length - 1, index + 1),
      ArrowUp: Math.max(0, index - 1),
      Home: 0,
      End: options.length - 1,
    }[event.key];
    if (nextIndex !== undefined) {
      event.preventDefault();
      const next = options[nextIndex]!;
      setActiveKey(next.key);
      scrollIntoView(next.key);
    } else if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      pick(activeOption.key);
    }
  };

  const chipLabel = selected?.label ?? "Auto";

  return (
    <Popover open={isOpen} onOpenChange={openChange}>
      <PopoverTrigger
        aria-label={`Model: ${chipLabel}`}
        className="inline-flex h-8 min-w-0 max-w-56 items-center gap-1.5 rounded-full px-2.5 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-hover data-[state=open]:text-ink"
      >
        {value === null && <SparkleIcon weight="fill" className="size-3.5 shrink-0 text-primary" />}
        <span className="truncate">{chipLabel}</span>
        <CaretDownIcon weight="bold" className="size-3 shrink-0 opacity-70" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchRef.current?.focus();
          requestAnimationFrame(() => scrollIntoView(value ?? AUTO));
        }}
        className="flex w-[19rem] flex-col overflow-hidden rounded-xl bg-popover p-0 ring-1 ring-line"
      >
        <label className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-3 text-muted-foreground focus-within:text-ink-2">
          <MagnifyingGlassIcon className="size-4 shrink-0" />
          <input
            ref={searchRef}
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={activeOption ? optionId(activeOption.key) : undefined}
            aria-autocomplete="list"
            aria-label="Search models"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search models"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              listRef.current?.scrollTo({ top: 0 });
            }}
            onKeyDown={navigate}
            className="h-full min-w-0 flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Models"
          className="max-h-72 overflow-y-auto overscroll-contain p-1"
        >
          {options.length === 0 && (
            <p className="px-2.5 py-6 text-center text-body-sm text-muted-foreground">
              No models match “{query.trim()}”.
            </p>
          )}
          {options.map((option, index) => {
            const isSelected = (value ?? AUTO) === option.key;
            const isActive = activeOption?.key === option.key;
            const startsGroup =
              option.groupLabel !== null && option.groupLabel !== options[index - 1]?.groupLabel;
            const detail = option.detail && option.detail !== option.label ? option.detail : null;
            return (
              <div key={option.key} role="presentation">
                {startsGroup && (
                  <p
                    role="presentation"
                    className={cn(
                      "px-2.5 pb-1 text-[11.5px] font-medium text-muted-foreground",
                      index === 0 ? "pt-1.5" : "mt-1 border-t border-line pt-2.5",
                    )}
                  >
                    {option.groupLabel}
                  </p>
                )}
                <div
                  id={optionId(option.key)}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActiveKey(option.key)}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => pick(option.key)}
                  className={cn(
                    "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-1.5",
                    isActive && "bg-hover",
                  )}
                >
                  {option.key === AUTO && (
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      <SparkleIcon weight="fill" className="size-4" />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={cn(
                        "truncate text-body-sm",
                        isSelected ? "font-semibold text-ink" : "text-ink-2",
                      )}
                    >
                      {option.label}
                    </span>
                    {detail && (
                      <span className="truncate text-[12px] text-muted-foreground">{detail}</span>
                    )}
                  </span>
                  {isSelected && (
                    <CheckIcon weight="bold" className="size-4 shrink-0 text-primary" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
