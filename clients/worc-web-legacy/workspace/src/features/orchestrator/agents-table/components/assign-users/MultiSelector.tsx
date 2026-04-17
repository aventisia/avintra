import { Input, LoadingSpinner } from "@aventisia/ui";
import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { WorkspaceUserDto } from "../../dtos/workspace-user-dto";

interface MultiSelectorProps {
  searchResults: WorkspaceUserDto[];
  selectedItems: WorkspaceUserDto[];
  onItemSelect: (item: WorkspaceUserDto) => void;
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
  placeholder = "Search and select items...",
  disabled,
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

  const handleItemSelect = (item: WorkspaceUserDto) => {
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
      <div className="flex min-h-10 items-center justify-between gap-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <ScrollArea
          onClick={() => {
            if (!disabled) inputRef.current?.focus();
          }}
          className={cn("grow", selectedItems.length > 2 && "h-16")}
        >
          <div className="flex flex-wrap items-center gap-1">
            {/* Selected Items */}
            {selectedItems.map((item) => (
              <Badge
                key={item.id}
                variant="outline"
                className="flex items-center pl-2.5 pr-0"
              >
                {/* <Avatar className={cn("flex h-5 w-5")}>
                <AvatarFallback className="bg-primary text-3xs font-bold capitalize tracking-wider text-secondary text-white">
                  {`${item.firstName?.charAt(0)}${item.lastName?.charAt(0)}`}
                </AvatarFallback>
              </Avatar> */}
                {/* Agent name */}
                <div className="flex flex-col">
                  {/* <p className="max-w-24 truncate text-2xs font-medium">
                    {`${item.firstName} ${item.lastName}`}
                  </p> */}
                  <span className="max-w-28 truncate text-2xs ">
                    {item.userName}
                  </span>
                </div>

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

            {/* Search Input */}
            <div className="relative min-w-28 flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                disabled={disabled}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={selectedItems.length === 0 ? placeholder : ""}
                className="h-5 w-full rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Dropdown Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="ml-1 h-6 w-6 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
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
                    <Avatar className={cn("flex h-7 w-7")}>
                      <AvatarFallback className="bg-muted text-xs border font-medium capitalize tracking-wider text-secondary">
                        {`${result.firstName?.charAt(0)}${result.lastName?.charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    {/* Agent name */}
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">
                        {`${result.firstName} ${result.lastName}`}
                      </p>
                      <span className="text-2xs text-muted-foreground">
                        {result.userName}
                      </span>
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
