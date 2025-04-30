import { useDebounce } from "@/react-toolkit/hooks/useDebounce";
import { cn } from "@/react-toolkit/lib/utils";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/react-toolkit/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { areStringsEqualCaseInsensitive } from "@/react-toolkit/utils";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface AsyncSelectProps<T> {
  /** Async function to fetch options */
  selectOptions: (query?: string) => Promise<T[]>;
  /** Preload all data ahead of time */
  preload?: boolean;
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean;
  /** Function to render each option */
  renderOption?: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue?: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue?: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: (query?: string) => React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;

  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;

  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
}

export function AsyncSelect<T extends ISelectOption>({
  selectOptions: fetcher,
  label,
  preload,
  filterFn,
  renderOption = DefaultAsyncSelectFieldRenderOption,
  getDisplayValue = DefaultAsyncSelectFieldgetDisplayValue,
  getOptionValue = (option) => option.value,
  notFound = () => DefaultNotFoundComponent(label),
  loadingSkeleton,
  placeholder = "Select...",
  value,
  onChange,
  disabled = false,
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
}: Readonly<AsyncSelectProps<T>>) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300);
  const [originalOptions, setOriginalOptions] = useState<T[]>([]);

  const callFetcher = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      // If we have a value, use it for the initial search
      const data = await fetcher(search);
      setOriginalOptions(data);
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    callFetcher(value);
    setSelectedValue(value);
  }, [value]);

  // Initialize selectedOption when options are loaded and value exists
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find((opt) =>
        areStringsEqualCaseInsensitive(getOptionValue(opt), value),
      );
      if (option) {
        setSelectedOption(option);
      }
    }
    //  else setSelectedOption(null);
  }, [value, options, getOptionValue]);

  // Effect for initial fetch
  useEffect(() => {
    const initializeOptions = async () => {
      callFetcher(value);
    };

    if (!mounted) {
      initializeOptions();
    }
  }, [mounted, fetcher, value]);

  useEffect(() => {
    const fetchOptions = async () => {
      callFetcher(debouncedSearchTerm);
    };

    if (!mounted) {
      fetchOptions();
    } else if (!preload) {
      fetchOptions();
    } else if (preload) {
      if (debouncedSearchTerm) {
        setOptions(
          originalOptions.filter((option) =>
            filterFn ? filterFn(option, debouncedSearchTerm) : true,
          ),
        );
      } else {
        setOptions(originalOptions);
      }
    }
  }, [fetcher, debouncedSearchTerm, mounted, preload, filterFn]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue =
        clearable && currentValue == selectedValue ? "" : currentValue;

      setSelectedValue(newValue);

      setSelectedOption(
        options.find((option) =>
          areStringsEqualCaseInsensitive(getOptionValue(option), newValue),
        ) ?? null,
      );
      onChange(newValue);
      setOpen(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span className={cn(disabled && "!cursor-not-allowed")}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            onClick={() => callFetcher("")}
            className={cn("justify-between", triggerClassName)}
            disabled={disabled}
          >
            {selectedOption ? (
              getDisplayValue(selectedOption)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="opacity-50" size={18} />
          </Button>
        </PopoverTrigger>
      </span>
      <PopoverContent className={cn("p-0", className)}>
        <Command shouldFilter={false}>
          <div className="relative w-full border-b">
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
              }}
            />
            {loading && options.length > 0 && (
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList>
            {error && (
              <div className="p-2 text-center text-destructive">{error}</div>
            )}
            {loading &&
              options.length === 0 &&
              (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound?.(debouncedSearchTerm) || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                  onSelect={handleSelect}
                >
                  {renderOption(option)}
                  <Check
                    className={cn(
                      "ml-auto h-3 w-3",
                      selectedValue === getOptionValue(option)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem key={i} disabled>
          <div className="flex w-full items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export const DefaultAsyncSelectFieldRenderOption = (option: ISelectOption) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-col">
      <div className="font-medium">{option.label}</div>
      <div className="text-xs text-muted-foreground">{option.description}</div>
    </div>
  </div>
);

export const DefaultAsyncSelectFieldgetDisplayValue = (
  option: ISelectOption,
) => (
  <div className="flex items-center gap-2 text-left">
    <div className="flex flex-col leading-tight">
      <div className="font-medium">{option.label}</div>
      <div className="text-xxs text-muted-foreground">{option.description}</div>
    </div>
  </div>
);

export const DefaultAsyncSelectFieldgetNotFoundComponent = () => (
  <div className="py-2 text-center text-sm">Not found</div>
);

export const DefaultNotFoundComponent = (message?: string) => (
  <div className="py-2 text-center text-sm lowercase">No {message} Found</div>
);
