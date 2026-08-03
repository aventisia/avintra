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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { Check, X } from "lucide-react";
import * as React from "react";

export interface Option {
  label: string;
  value: string;
}

export interface ActionSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  actionSelect?: ActionSelectProps;
  className?: string;
  disabled?: boolean;
  fieldSize?: FormFieldSizeType;
}

export function MultiSelectCombobox({
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  actionSelect,
  className,
  disabled = false,
  fieldSize = "base",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (itemValue: string) => {
    onChange(value.filter((i) => i !== itemValue));
  };

  const handleSelect = (itemValue: string) => {
    if (value.includes(itemValue)) {
      onChange(value.filter((i) => i !== itemValue));
    } else {
      onChange([...value, itemValue]);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow",
        "focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
        disabled && "cursor-not-allowed opacity-80",
        fieldSize === "xs" && "min-h-7",
        fieldSize === "sm" && "min-h-8",
        fieldSize === "base" && "min-h-10",
        className,
      )}
    >
      {/* LEFT SIDE: Shadcn Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex w-full flex-1 items-center justify-between hover:bg-transparent h-auto font-normal focus:ring-0 focus:ring-offset-0",
              fieldSize === "xs" && "px-[0.45rem] py-1 text-2xs",
              fieldSize === "sm" && "px-[0.55rem] py-1 text-xs",
              fieldSize === "base" && "px-3 py-1.5 text-sm",
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
              {value.length > 0 ? (
                value.map((val) => {
                  const option = options.find((o) => o.value === val);
                  return (
                    <Badge
                      key={val}
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1 rounded-full bg-background font-normal",
                        fieldSize === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5",
                      )}
                    >
                      {option?.label || val}
                      <div
                        role="button"
                        tabIndex={0}
                        className="ml-1 rounded-full cursor-pointer outline-none hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !disabled) handleUnselect(val);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!disabled) handleUnselect(val);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </div>
                    </Badge>
                  );
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                      <div className="flex w-full items-center justify-between">
                        {option.label}
                        <Check
                          className={cn("h-3.5 w-3.5", isSelected ? "opacity-100" : "opacity-0")}
                        />
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* RIGHT SIDE: Optional Inline Select */}
      {actionSelect && (
        <div className="shrink-0 border-l border-input">
          <Select
            disabled={disabled}
            value={actionSelect.value}
            onValueChange={actionSelect.onChange}
          >
            <SelectTrigger
              className={cn(
                "w-auto min-w-[140px] rounded-none border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0",
                fieldSize === "xs" && "h-7 text-2xs",
                fieldSize === "sm" && "h-8 text-xs",
                fieldSize === "base" && "h-10 text-sm",
              )}
            >
              <SelectValue placeholder={actionSelect.placeholder || "Select Option"} />
            </SelectTrigger>
            <SelectContent>
              {actionSelect.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
