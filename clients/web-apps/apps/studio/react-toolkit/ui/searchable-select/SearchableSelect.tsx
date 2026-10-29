import { LoadingSpinner } from "@avplatform/ui";
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
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { resolveAssetSrc } from "@/utils/resolve-asset-src.util";

export type ISearchableSelectOption = ISelectOption & {
  icon?: string;
};

type SearchableSelectProps = {
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
  /** Rendered in place of the icon for options whose `icon` is not set. */
  fallbackIcon?: React.ReactNode;
};

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
  fallbackIcon,
}: SearchableSelectProps) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const selectedItemRef = React.useRef<HTMLDivElement>(null);

  const basePath = import.meta.env.VITE_STUDIO_PATH.replace(/\/$/, "");

  const selectedSrc = selectedOption?.icon
    ? resolveAssetSrc(selectedOption.icon, basePath)
    : undefined;

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
          className={cn("w-full justify-between hover:bg-background", sizeClasses[size], className)}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedSrc ? (
              <img
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                src={selectedSrc}
                alt=""
              />
            ) : (
              selectedOption && fallbackIcon
            )}
            <span className="line-clamp-1">{selectedOption?.label ?? placeholder}</span>
          </span>
          <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50")} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(className, "w-[--radix-popover-trigger-width] p-2")}
      >
        <Command>
          <div className="mb-1.5 rounded-lg bg-sunken">
            <CommandInput className="h-9 text-xs" placeholder={searchPlaceholder} autoFocus />
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
                {options.map((option) => {
                  const optionSrc = option.icon
                    ? resolveAssetSrc(option.icon, basePath)
                    : undefined;
                  return (
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
                        <div className="flex items-center gap-2">
                          {optionSrc ? (
                            <img
                              className="flex h-4 w-4 shrink-0 items-center justify-center"
                              src={optionSrc}
                              alt=""
                            />
                          ) : (
                            fallbackIcon
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
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

SearchableSelect.displayName = "SearchableSelect";
