// components/MultiSelector.tsx
import { Input, LoadingSpinner } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { CaretDownIcon, CaretUpIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { AssignMachineDto } from "../../dtos/assign-machine-dto";

interface MultiSelectorProps {
  searchResults: AssignMachineDto[];
  selectedItems: AssignMachineDto[];
  onItemSelect: (item: AssignMachineDto) => void;
  onItemRemove: (id: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  placeholder?: string;
  maxHeight?: string;
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
  //   maxHeight = "200px",
}) => {
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
    // setIsOpen(true);
  };

  const handleItemSelect = (item: AssignMachineDto) => {
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

  const filteredResults = searchResults.filter((result) => !isItemSelected(result.id));

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Items and Input Container */}
      <div className="flex min-h-11 items-center justify-between gap-2 rounded-md bg-popover px-3.5 py-2 text-body-sm ring-1 ring-border transition-shadow focus-within:ring-focus">
        <ScrollArea
          onClick={() => {
            inputRef.current?.focus();
          }}
          className={cn("grow", selectedItems.length > 2 && "h-16")}
        >
          <div className="flex flex-wrap items-center gap-1">
            {/* Selected Items */}
            {selectedItems.map((item) => (
              <Badge key={item.id} variant="outline" className="flex items-center pl-2.5 pr-0">
                {/* Agent name */}
                <div className="flex flex-col">
                  <p className="max-w-24 truncate text-2xs font-medium">{`${item.name} `}</p>
                  {/* <span className="max-w-24 truncate text-3xs text-muted-foreground">
                    {item.type}
                  </span> */}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon7"
                  className="rounded-full"
                  onClick={() => onItemRemove(item.id)}
                >
                  <XIcon className="h-4 w-4" />
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
        >
          {isOpen ? <CaretUpIcon className="h-4 w-4" /> : <CaretDownIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 h-fit w-full rounded-lg border border-line bg-popover shadow-pop">
          <div className="p-2">
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <LoadingSpinner className="mr-2 h-4 w-4 text-primary" />
                Searching...
              </div>
            )}
            {isError && (
              <div className="p-4 text-center text-sm text-bad">Error loading results</div>
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
                    {/* Agent name */}
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">{`${result.name}`}</p>
                      {/* <span className="text-2xs text-muted-foreground">
                        {result.type}
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
