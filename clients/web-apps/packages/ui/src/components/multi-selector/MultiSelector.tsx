import { CheckIcon, XIcon as RemoveIcon } from "@phosphor-icons/react";
import { Command as CommandPrimitive } from "cmdk";
import React, {
  type KeyboardEvent,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
} from "react";

import { Badge } from "@/ui/components/badge";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/ui/components/command";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

type MultiSelectorProps = {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  /** Optional mapping from a stored value to its display label shown in the badge. Defaults to the value itself. */
  valueToLabel?: (value: string) => string;
} & React.ComponentPropsWithoutRef<typeof CommandPrimitive>;

interface MultiSelectContextProps {
  value: string[];
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  valueToLabel: (value: string) => string;
}

const MultiSelectContext = createContext<MultiSelectContextProps | null>(null);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within MultiSelectProvider");
  }
  return context;
};

const MultiSelector = ({
  values: value,
  onValuesChange: onValueChange,
  loop = false,
  valueToLabel = (v) => v,
  className,
  children,
  dir,
  ...props
}: MultiSelectorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const onValueChangeHandler = useCallback(
    (val: string) => {
      if (value.includes(val)) {
        onValueChange(value.filter((item) => item !== val));
      } else {
        onValueChange([...value, val]);
      }
    },
    [value, onValueChange],
  );

  // TODO : change from else if use to switch case statement

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const moveNext = () => {
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex > value.length - 1 ? (loop ? 0 : -1) : nextIndex);
      };

      const movePrev = () => {
        const prevIndex = activeIndex - 1;
        setActiveIndex(prevIndex < 0 ? value.length - 1 : prevIndex);
      };

      if ((e.key === "Backspace" || e.key === "Delete") && value.length > 0) {
        if (inputValue.length === 0) {
          if (activeIndex !== -1 && activeIndex < value.length) {
            onValueChange(value.filter((item) => item !== value[activeIndex]));
            const newIndex = activeIndex - 1 < 0 ? 0 : activeIndex - 1;
            setActiveIndex(newIndex);
          } else {
            onValueChange(value.filter((item) => item !== value[value.length - 1]));
          }
        }
      } else if (e.key === "Enter") {
        setOpen(true);
      } else if (e.key === "Escape") {
        if (activeIndex !== -1) {
          setActiveIndex(-1);
        } else {
          setOpen(false);
        }
      } else if (dir === "rtl") {
        if (e.key === "ArrowRight") {
          movePrev();
        } else if (e.key === "ArrowLeft" && (activeIndex !== -1 || loop)) {
          moveNext();
        }
      } else {
        if (e.key === "ArrowLeft") {
          movePrev();
        } else if (e.key === "ArrowRight" && (activeIndex !== -1 || loop)) {
          moveNext();
        }
      }
    },
    [value, inputValue, activeIndex, loop, dir, onValueChange],
  );

  return (
    <MultiSelectContext.Provider
      value={{
        value,
        onValueChange: onValueChangeHandler,
        open,
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        valueToLabel,
      }}
    >
      <Command
        onKeyDown={handleKeyDown}
        className={cn("flex flex-col space-y-1 overflow-visible bg-transparent", className)}
        dir={dir}
        {...props}
      >
        {children}
      </Command>
    </MultiSelectContext.Provider>
  );
};

interface MultiSelectorTriggerProps {
  disabled?: boolean;
  size?: FormFieldSizeType;
}

const MultiSelectorTrigger = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & MultiSelectorTriggerProps
>(({ className, disabled, size = "base", children, ...props }, ref) => {
  const { value, onValueChange, activeIndex, valueToLabel } = useMultiSelect();

  const mousePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "!mt-0 flex flex-wrap items-center gap-1.5 rounded-md border border-line-strong bg-surface text-ink transition-[border-color,box-shadow] duration-[120ms] ease-out focus-within:border-focus focus-within:ring-[3px] focus-within:ring-focus/[0.28] motion-reduce:transition-none",
        size === "xs" && "min-h-6 py-0.5 pl-1 pr-1 text-hint",
        size === "sm" && "min-h-7 py-0.5 pl-1 pr-1 text-body-sm",
        size === "base" && "min-h-8 py-1 pl-1 pr-1 text-body",
        className,
        disabled ? "cursor-not-allowed border-line bg-sunken text-muted-foreground" : "cursor-auto",
      )}
      {...props}
    >
      {Array.isArray(value)
        ? value?.map((item, index) => (
            <Badge
              key={index}
              className={cn(
                "flex h-5 cursor-default items-center gap-1 rounded-sm py-0 pl-1.5 pr-1",
                size === "xs" && "h-4",
                activeIndex === index && "ring-2 ring-focus",
                disabled ? "cursor-not-allowed" : "cursor-auto",
              )}
              variant={"secondary"}
            >
              <span
                className={cn(
                  size === "xs" && "text-3xs",
                  size === "sm" && "text-2xs",
                  size === "base" && "text-xs",
                )}
              >
                {valueToLabel(item)}
              </span>
              <button
                aria-label={`Remove ${item} option`}
                aria-roledescription="button to remove option"
                type="button"
                onMouseDown={mousePreventDefault}
                onClick={() => onValueChange(item)}
                disabled={disabled}
                className={cn(disabled ? "cursor-not-allowed" : "cursor-auto")}
              >
                <span className="sr-only">Remove {item} option</span>
                <RemoveIcon
                  className={cn(
                    size === "xs" && "h-3 w-3",
                    size === "sm" && "h-3.5 w-3.5",
                    size === "base" && "h-4 w-4",
                    disabled ? "cursor-not-allowed" : "cursor-auto hover:text-bad",
                  )}
                />
              </button>
            </Badge>
          ))
        : null}
      {children}
    </div>
  );
});

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

const MultiSelectorInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    fieldSize?: FormFieldSizeType;
  }
>(({ className, fieldSize = "base", ...props }, ref) => {
  const { setOpen, inputValue, setInputValue, activeIndex, setActiveIndex } = useMultiSelect();
  return (
    <CommandPrimitive.Input
      {...props}
      ref={ref}
      value={inputValue}
      onValueChange={activeIndex === -1 ? setInputValue : undefined}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onClick={() => setActiveIndex(-1)}
      className={cn(
        "flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        fieldSize === "xs" && "ml-1 text-hint",
        fieldSize === "sm" && "ml-1 text-body-sm",
        fieldSize === "base" && "ml-1.5 text-body",
        className,
        activeIndex !== -1 && "caret-transparent",
      )}
    />
  );
});

MultiSelectorInput.displayName = "MultiSelectorInput";

const MultiSelectorContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children }, ref) => {
    const { open } = useMultiSelect();
    return (
      <>
        {open && (
          <div ref={ref} className="relative">
            {children}
          </div>
        )}
      </>
    );
  },
);

MultiSelectorContent.displayName = "MultiSelectorContent";

const MultiSelectorList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, children }, ref) => {
  return (
    <CommandList
      ref={ref}
      className={cn(
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg absolute top-0 z-10 flex w-full flex-col gap-2 rounded-lg bg-surface p-1 text-ink shadow-pop transition-colors",
        className,
      )}
    >
      {children}
      <CommandEmpty>
        <span className="text-muted-foreground">No results found</span>
      </CommandEmpty>
    </CommandList>
  );
});

MultiSelectorList.displayName = "MultiSelectorList";

const MultiSelectorItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  { value: string; size?: FormFieldSizeType } & React.ComponentPropsWithoutRef<
    typeof CommandPrimitive.Item
  >
>(({ className, value, size = "base", children, ...props }, ref) => {
  const { value: Options, onValueChange, setInputValue } = useMultiSelect();

  const mousePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isIncluded = Options.includes(value);
  return (
    <CommandItem
      ref={ref}
      {...props}
      onSelect={() => {
        onValueChange(value);
        setInputValue("");
      }}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1 transition-colors data-[selected=true]:bg-hover [&>svg]:text-primary-text",
        size === "xs" && "px-1 py-1 text-2xs",
        size === "sm" && "px-1.5 py-1 text-xs",
        size === "base" && "min-h-8 px-2 py-1 text-body-sm",
        className,
        isIncluded && "cursor-default",
        props.disabled && "cursor-not-allowed text-muted-foreground",
      )}
      onMouseDown={mousePreventDefault}
    >
      {children}
      {isIncluded && (
        <CheckIcon
          className={cn(
            size === "xs" && "h-3 w-3",
            size === "sm" && "h-3.5 w-3.5",
            size === "base" && "h-4 w-4",
          )}
        />
      )}
    </CommandItem>
  );
});

MultiSelectorItem.displayName = "MultiSelectorItem";

export {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
};
