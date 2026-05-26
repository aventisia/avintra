import { Input, LoadingSpinner } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SearchAgentsDto } from "../../dtos/search-agent-dto";

interface MultiSelectorProps {
  searchResults: SearchAgentsDto[];
  selectedItems: SearchAgentsDto[];
  onItemSelect: (item: SearchAgentsDto) => void;
  onItemRemove: (id: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  placeholder?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export const MultiSelector: React.FC<MultiSelectorProps> = ({
  searchResults,
  selectedItems,
  onItemSelect,
  onItemRemove,
  onSearchChange,
  //   searchQuery,
  isLoading,
  isError,
  disabled,
  placeholder = "Search and select items...",
  //   maxHeight = "200px",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onSearchChange(value);
    // setIsOpen(true);
  };

  const handleItemSelect = (item: SearchAgentsDto) => {
    onItemSelect(item);
    setInputValue("");
    onSearchChange("");
    setIsOpen(false);
    // inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isItemSelected = (id: string) => {
    return selectedItems.some((item) => item.id === id);
  };

  const filteredResults = searchResults.filter(
    (result) => !isItemSelected(result.id),
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Items and Input Container */}
      <div className="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-input bg-background px-2 py-1.5 text-sm shadow-sm shadow-black/5 ring-offset-background transition-shadow focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring focus-within:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-80">
        <ScrollArea
          onClick={() => {
            inputRef.current?.focus();
          }}
          className={cn("grow", selectedItems.length > 3 && "h-[4rem]")}
        >
          <div className="flex flex-wrap items-center gap-1">
            {/* Selected Items */}
            {selectedItems.map((item) => (
              <Badge
                key={item.id}
                variant="outline"
                className="flex items-center py-0 pl-2.5 pr-0"
              >
                {/* Agent name */}
                <div className="flex flex-col">
                  <p
                    className="max-w-36 truncate text-2xs font-medium"
                    title={`${item.name} -v${item.versionNumber}`}
                  >
                    {`${item.name} -v${item.versionNumber}`}
                  </p>
                  {/* <span className="max-w-24 truncate text-3xs text-muted-foreground">
                    {item.userName}
                  </span> */}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon7"
                  className="rounded-full"
                  onClick={() => onItemRemove(item.id)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Badge>
            ))}

            {/* Search Input */}
            <div className="relative min-w-28 flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={selectedItems.length === 0 ? placeholder : ""}
                className="h-5 w-full rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={disabled}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Dropdown Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-1 h-6 w-6 p-0"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Dropdown Results */}
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
              <div className="p-4 text-center text-sm text-red-600">
                Error loading results
              </div>
            )}
            {!isLoading &&
              !isError &&
              inputValue &&
              filteredResults.length === 0 && (
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
                      isItemSelected(result.id) &&
                        "cursor-not-allowed opacity-50",
                    )}
                    onClick={() =>
                      !isItemSelected(result.id) && handleItemSelect(result)
                    }
                  >
                    {/* Agent name */}
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">
                        {`${result.name} -v${result.versionNumber}`}
                      </p>
                      {/* <span className="text-2xs text-muted-foreground">
                        {result.userName}
                      </span> */}
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
