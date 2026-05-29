import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { cn } from "@aventisia/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormFieldSizeType, ISelectOption } from "@aventisia/ui/types";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

// 1. Extend the option interface to accept an optional ReactNode for the icon
export interface ISearchableSelectOption extends ISelectOption {
  icon?: string;
}

interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: ISearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  primaryText?: string;
  disabled?: boolean;
  size?: FormFieldSizeType;
  className?: string;
  isLoading?: boolean;
}

const sizeClasses: Record<FormFieldSizeType, string> = {
  xs: "h-7 text-2xs px-2",
  sm: "h-8 text-xs px-2.5",
  base: "h-10 text-sm px-3",
};

export const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  primaryText,
  disabled,
  size = "base",
  className,
  isLoading,
}: SearchableSelectProps) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const selectedItemRef = React.useRef<HTMLDivElement>(null);

  const basePath = import.meta.env.VITE_STUDIO_PATH.replace(/\/$/, "");

  // Scroll to selected item when popover opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (selectedItemRef.current)
          selectedItemRef.current.scrollIntoView({
            block: "nearest",
          });
      }, 100);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "w-full justify-between hover:bg-background",
            sizeClasses[size],
            className,
          )}
        >
          {/* 2. Render the icon in the trigger if it exists */}
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon && (
              <img
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                src={
                  selectedOption.icon.includes("http")
                    ? selectedOption.icon
                    : basePath + selectedOption.icon
                }
              />
            )}
            <span className="line-clamp-1">
              {selectedOption?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50")} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          className,
          "w-[--radix-popover-trigger-width] p-2",
          "shadow-sm",
        )}
      >
        <Command>
          <div className="mb-1.5 rounded-lg bg-slate-100">
            <CommandInput
              className="h-9 text-xs"
              placeholder={searchPlaceholder}
              autoFocus
            />
          </div>
          <CommandList>
            <CommandEmpty>{"No results found."}</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {isLoading ? (
                  <div className="flex h-60 items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                    <>
                      <LoadingSpinner className="size-3.5 text-primary" />
                      Fetching {primaryText}...
                    </>
                  </div>
                ) : null}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    ref={value === option.value ? selectedItemRef : null}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(value === option.value && "bg-accent")}
                  >
                    <div className="flex w-full items-center justify-between">
                      {/* 3. Render the icon in the dropdown list if it exists */}
                      <div className="flex items-center gap-2">
                        {option.icon && (
                          <img
                            className="flex h-4 w-4 shrink-0 items-center justify-center"
                            src={
                              option.icon.includes("http")
                                ? option.icon
                                : basePath + option.icon
                            }
                          />
                        )}
                        <span>{option.label}</span>
                      </div>
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
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

SearchableSelect.displayName = "SearchableSelect";
