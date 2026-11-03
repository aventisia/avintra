import { LoadingSpinner } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { ScrollArea } from "@avplatform/ui/scroll";
import { FormFieldSizeType, ISelectOption } from "@avplatform/ui/types";
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import * as React from "react";

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: ISelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  className?: string;
  isLoading?: boolean;
}

const sizeClasses: Record<FormFieldSizeType, string> = {
  xs: "min-h-7 text-2xs px-1 py-1",
  sm: "min-h-8 text-xs px-1.5  py-1",
  base: "min-h-control-md text-sm px-3 py-1",
};

const badgeSizeClasses: Record<FormFieldSizeType, string> = {
  xs: "text-3xs px-1 py-0 ", // tiny badges
  sm: "text-2xs px-1.5 py-0.5 ", // small badges
  base: "text-xs px-2 py-0.5 h-6", // default
};

const MAX_HEIGHT = 96; // max px before scrolling

export const MultiSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  disabled,
  size = "base",
  className,
  isLoading,
}: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<number | undefined>(undefined);

  const selectedOptions = React.useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value],
  );

  const availableOptions = React.useMemo(
    () => options.filter((o) => !value.includes(o.value)),
    [options, value],
  );

  const removeValue = (v: string) => onValueChange(value.filter((x) => x !== v));

  // dynamically update height
  React.useEffect(() => {
    if (contentRef.current) {
      const scrollH = contentRef.current.scrollHeight;
      setContainerHeight(Math.min(scrollH, MAX_HEIGHT));
    }
  }, [selectedOptions]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-multiselectable
          disabled={disabled}
          className={cn(
            "relative h-auto w-full py-2 hover:bg-background",
            sizeClasses[size],
            className,
            "pr-5",
          )}
        >
          <ScrollArea
            style={{ height: containerHeight }} // dynamic height
            className="w-full pr-1"
          >
            <div ref={contentRef} className="flex flex-wrap gap-1.5">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((o) => (
                  <Badge
                    key={o.value}
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1 bg-accent font-normal",
                      badgeSizeClasses[size], // <-- dynamic sizing
                    )}
                  >
                    {o.label}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(o.value);
                      }}
                    />
                  </Badge>
                ))
              )}
            </div>
          </ScrollArea>

          <CaretDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(className, "w-[--radix-popover-trigger-width] p-2 shadow-pop")}
      >
        <Command>
          <div className="mb-1.5 rounded-lg bg-sunken">
            <CommandInput
              className="h-9 text-xs"
              placeholder={searchPlaceholder}
              aria-label="Search options"
              autoFocus
            />
          </div>

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup>
              <ScrollArea className="h-64">
                {isLoading && (
                  <div className="flex h-32 items-center justify-center gap-2 text-xs">
                    <LoadingSpinner className="size-3.5" />
                    Loading...
                  </div>
                )}

                {availableOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange([...value, option.value]);
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      {option.label}
                      <CheckIcon className="h-3.5 w-3.5 opacity-0" />
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

MultiSelect.displayName = "MultiSelect";
