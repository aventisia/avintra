import { CircleXIcon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/ui/components/Input";
import { LoadingSpinner } from "@/ui/components/LoadingSpinner";
import { Button } from "@/ui/components/buttons";
import { ScrollArea } from "@/ui/components/scroll";
import { cn } from "@/ui/lib";

import type { AsyncMultiSelectProps } from "./types";
import { useDebouncedSearch } from "./useDebouncedSearch";

/**
 * Async multi-select input with debounced remote search.
 */
export const AsyncMultiSelect = <TItem, TFilters = undefined>({
  placeholder = "Search and add items...",
  className,
  maxHeightClassName = "h-56",
  queryKeyBase,
  fetcher,
  filters,
  selectedItems = [],
  onSelectMultiple,
  getItemId,
  getItemLabel,
  renderItem,
  debounceMs = 400,
  minChars = 1,
  enabled = true,
  disabled = false,
  size = "base",
  loadingText = "Searching...",
  errorText = "Failed to load results. Please try again.",
  startTypingText = "Start typing to search...",
  noResultsText = "No results found",
}: AsyncMultiSelectProps<TItem, TFilters>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const isEnabled = enabled && !disabled;

  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    data: searchResults = [],
    isLoading,
    isError,
  } = useDebouncedSearch<TItem[], TFilters>({
    queryKeyBase,
    fetcher,
    filters,
    debounceMs,
    minChars,
    enabled: isEnabled,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  const normalizedSearchTerm = searchTerm.trim();
  const isDebouncing =
    normalizedSearchTerm.length >= minChars && normalizedSearchTerm !== debouncedSearchTerm;
  const isSearching = isLoading || isDebouncing;
  const shouldShowDropdown = isEnabled && isOpen && normalizedSearchTerm.length > 0;

  const selectedIds = useMemo(() => {
    return new Set(selectedItems.map((item) => getItemId(item)));
  }, [selectedItems, getItemId]);

  const visibleResults = useMemo(
    () => searchResults.filter((item) => !selectedIds.has(getItemId(item))),
    [searchResults, selectedIds, getItemId],
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [visibleResults.length]);

  useEffect(() => {
    if (!listRef.current || highlightedIndex < 0) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-item]");
    items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const statusText = () => {
    if (!searchTerm) return startTypingText;
    if (normalizedSearchTerm.length < minChars) {
      return minChars === 1 ? startTypingText : `Type at least ${minChars} characters to search`;
    }
    if (isSearching) return loadingText;
    if (isError) return errorText;
    if (visibleResults.length === 0) return `${noResultsText} for "${searchTerm}"`;
    return `${visibleResults.length} result${visibleResults.length === 1 ? "" : "s"} found`;
  };

  const handleSelect = useCallback(
    (item: TItem) => {
      onSelectMultiple([...selectedItems, item]);
      setHighlightedIndex(-1);
    },
    [selectedItems, onSelectMultiple],
  );

  const handleClear = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const removeSelectedItem = (itemIdToRemove: string) => {
    onSelectMultiple(selectedItems.filter((item) => getItemId(item) !== itemIdToRemove));
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      }}
    >
      {selectedItems.length > 0 && (
        <div className="-mb-2 flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-slate-50 px-1 py-1 pb-3">
          {selectedItems.map((item) => {
            const itemId = getItemId(item);

            return (
              <div
                key={itemId}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border bg-background py-[0.15rem] pl-2 pr-1",
                  size === "base" && "text-sm",
                  size === "sm" && "text-xs",
                  size === "xs" && "text-2xs",
                )}
              >
                <span className="max-w-56 truncate">{getItemLabel(item)}</span>
                {!disabled && (
                  <Button
                    type="button"
                    variant={"ghost"}
                    className="size-3.5 p-0 text-muted-foreground hover:bg-red-50 hover:text-destructive focus:bg-red-50 focus:text-destructive"
                    onClick={() => removeSelectedItem(itemId)}
                  >
                    <XIcon className="stroke-[2.5]" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="relative">
        <SearchIcon
          className={cn(
            "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            size === "base" && "left-2.5 size-4",
            size === "sm" && "left-2 size-3.5",
            size === "xs" && "left-[0.45rem] size-3",
          )}
        />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          fieldSize={size}
          disabled={disabled}
          className={cn(
            size === "base" && "pl-8 pr-8",
            size === "sm" && "pl-7 pr-7",
            size === "xs" && "pl-[1.36rem] pr-[1.36rem]",
          )}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (!isOpen || !isEnabled) return;

            switch (e.key) {
              case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.min(prev + 1, visibleResults.length - 1));
                break;
              case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                break;
              case "Enter":
                if (highlightedIndex >= 0 && visibleResults[highlightedIndex]) {
                  e.preventDefault();
                  handleSelect(visibleResults[highlightedIndex]);
                }
                break;
            }
          }}
          onChange={(e) => {
            if (!isEnabled) return;
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (isEnabled && searchTerm.trim().length > 0) {
              setIsOpen(true);
            }
          }}
        />

        {searchTerm && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size={size === "base" ? "icon7" : size === "sm" ? "icon6" : "icon5"}
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              size === "base" && "right-[0.36rem]",
              size === "sm" && "right-[0.2rem]",
              size === "xs" && "right-[0.17rem]",
            )}
            onClick={handleClear}
          >
            <CircleXIcon
              className={cn(
                "text-muted-foreground",
                size === "base" && "size-4",
                size === "sm" && "size-3.5",
                size === "xs" && "size-3",
              )}
            />
          </Button>
        )}
      </div>
      {shouldShowDropdown && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white shadow">
          <div
            className={cn(
              "border-b px-3 py-2 text-muted-foreground",
              size === "base" && "px-3 py-2 text-xs",
              size === "sm" && "px-2.5 py-1.5 text-2xs",
              size === "xs" && "px-2.5 py-1.5 text-3xs",
            )}
          >
            {isSearching ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner
                  className={cn(
                    "text-primary",
                    size === "base" && "size-4",
                    size === "sm" && "size-3.5",
                    size === "xs" && "size-3",
                  )}
                />
                {statusText()}
              </span>
            ) : (
              statusText()
            )}
          </div>

          {!isSearching && !isError && visibleResults.length > 0 && (
            <ScrollArea className={maxHeightClassName}>
              <div className="p-1" ref={listRef}>
                {visibleResults.map((item, index) => {
                  const itemId = getItemId(item);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={itemId}
                      data-item
                      type="button"
                      className={cn(
                        "flex w-full items-center rounded-md text-left transition-colors hover:bg-accent",
                        isHighlighted && "bg-accent outline-none ring-1 ring-inset ring-ring",
                        size === "base" && "px-2.5 py-1.5 text-sm",
                        size === "sm" && "px-[0.55rem] py-[0.34rem] text-xs",
                        size === "xs" && "px-[0.45rem] py-[0.25rem] text-2xs",
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      onClick={() => handleSelect(item)}
                    >
                      {renderItem ? (
                        renderItem(item)
                      ) : (
                        <span className="truncate">{getItemLabel(item)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};
