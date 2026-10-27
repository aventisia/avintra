import { CircleXIcon, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/ui/components/Input";
import { LoadingSpinner } from "@/ui/components/LoadingSpinner";
import { Button } from "@/ui/components/buttons";
import { ScrollArea } from "@/ui/components/scroll";
import { cn } from "@/ui/lib";

import type { AsyncSingleSelectProps } from "./types";
import { useDebouncedSearch } from "./useDebouncedSearch";

/**
 * Async single-select input with debounced remote search.
 */
export const AsyncSingleSelect = <TItem, TFilters = undefined>({
  placeholder = "Search...",
  className,
  maxHeightClassName = "h-56",
  queryKeyBase,
  fetcher,
  filters,
  selectedItem = null,
  onSelect,
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
}: AsyncSingleSelectProps<TItem, TFilters>) => {
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

  const selectedId = selectedItem ? getItemId(selectedItem) : null;
  const visibleResults = searchResults.filter((item) => getItemId(item) !== selectedId);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [visibleResults.length]);

  useEffect(() => {
    if (!listRef.current || highlightedIndex < 0) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-item]");
    items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const selectedLabel = selectedItem ? getItemLabel(selectedItem) : "";
  const inputValue = isOpen ? searchTerm : selectedLabel;

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
      onSelect(item);
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    },
    [onSelect, setSearchTerm],
  );

  const handleClear = () => {
    if (searchTerm.trim().length > 0) {
      setSearchTerm("");
      setHighlightedIndex(-1);
      setIsOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    onSelect(null);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm("");
    requestAnimationFrame(() => inputRef.current?.focus());
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
      <div className="relative">
        <SearchIcon
          className={cn(
            "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "base" && "left-2.5 size-4",
            size === "sm" && "left-2 size-3.5",
            size === "xs" && "left-[0.45rem] size-3",
          )}
        />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
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
            setIsOpen(true);
          }}
          onFocus={() => {
            if (isEnabled && searchTerm.trim().length > 0) {
              setIsOpen(true);
            }
          }}
        />

        {(selectedItem || searchTerm) && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size={size === "base" ? "icon7" : size === "sm" ? "icon6" : "icon5"}
            className={cn("absolute right-0.5 top-1/2 -translate-y-1/2")}
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
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg bg-surface text-ink shadow-pop">
          <div
            className={cn(
              "border-b border-line px-3 py-2 text-muted-foreground",
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
                        "flex w-full items-center rounded-sm text-left transition-colors duration-[120ms] ease-out hover:bg-hover",
                        isHighlighted && "bg-hover outline-none ring-1 ring-inset ring-focus",
                        size === "base" && "min-h-[30px] px-2 py-1 text-body-sm",
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
