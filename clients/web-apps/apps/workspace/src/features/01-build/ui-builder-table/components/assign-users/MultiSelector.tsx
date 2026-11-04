import { Input, LoadingSpinner } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { SearchedUser } from "@avplatform/ui/types";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MultiSelectorProps {
  searchResults: SearchedUser[];
  selectedItems: SearchedUser[];
  onItemSelect: (item: SearchedUser) => void;
  onItemRemove: (id: string) => void;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  isError: boolean;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Async user picker used by the UI builder project assignment dialog.
 */
export const MultiSelector = ({
  searchResults,
  selectedItems,
  onItemSelect,
  onItemRemove,
  onSearchChange,
  isLoading,
  isError,
  placeholder = "Search and select users...",
  disabled,
}: MultiSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onSearchChange(value);
  };

  const handleItemSelect = (item: SearchedUser) => {
    onItemSelect(item);
    setInputValue("");
    onSearchChange("");
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isItemSelected = (id: string) => selectedItems.some((item) => item.id === id);
  const filteredResults = searchResults.filter((result) => !isItemSelected(result.id));

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex min-h-10 items-center justify-between gap-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <ScrollArea
          onClick={() => {
            if (!disabled) inputRef.current?.focus();
          }}
          className={cn("grow", selectedItems.length > 2 && "h-16")}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedItems.map((item) => (
              <Badge key={item.id} variant="outline" className="flex items-center pl-2.5 pr-0">
                <span className="max-w-28 truncate text-2xs">{item.userName}</span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon5"
                  className="rounded-full"
                  disabled={disabled}
                  onClick={() => onItemRemove(item.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </Badge>
            ))}

            <div className="relative min-w-28 flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                disabled={disabled}
                onChange={(event) => handleInputChange(event.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={selectedItems.length === 0 ? placeholder : ""}
                className="h-5 w-full rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </ScrollArea>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="ml-1 h-6 w-6 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 h-fit w-full rounded-lg border bg-white shadow">
          <div className="p-2">
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <LoadingSpinner className="mr-2 h-4 w-4 text-primary" />
                Searching...
              </div>
            )}
            {isError && (
              <div className="p-4 text-center text-sm text-red-600">Error loading results</div>
            )}
            {!isLoading && !isError && inputValue && filteredResults.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{inputValue}"
              </div>
            )}
            {!isLoading && !isError && !inputValue && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Start typing to search...
              </div>
            )}
            {filteredResults.length ? (
              <ScrollArea className="h-52">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent",
                      isItemSelected(result.id) && "cursor-not-allowed opacity-50",
                    )}
                    onClick={() => !isItemSelected(result.id) && handleItemSelect(result)}
                  >
                    <Avatar className="flex h-7 w-7">
                      <AvatarFallback className="bg-muted text-xs border font-medium capitalize tracking-wider text-secondary">
                        {`${result.firstName?.charAt(0)}${result.lastName?.charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">
                        {`${result.firstName} ${result.lastName}`}
                      </p>
                      <span className="text-2xs text-muted-foreground">{result.userName}</span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
