import { Input, LoadingSpinner } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { ISelectOption } from "@avplatform/ui/types";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { WorkspaceUserDto } from "../dtos/workspace-user.dto";

// Added ActionSelectProps for the right-side field
export interface ActionSelectProps {
  options: ISelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

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
  disabled?: boolean;
  actionSelect?: ActionSelectProps; // Prop for the dual-field design
  className?: string;
}

export const MultiSelector: React.FC<MultiSelectorProps> = ({
  searchResults,
  selectedItems,
  onItemSelect,
  onItemRemove,
  onSearchChange,
  isLoading,
  isError,
  placeholder = "Search and select items...",
  disabled = false,
  actionSelect,
  className,
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
  };

  const handleItemSelect = (item: WorkspaceUserDto) => {
    onItemSelect(item);
    setInputValue("");
    onSearchChange("");
    setIsOpen(false);
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

  const optionLabel = actionSelect?.options?.find(
    (option) => option.value == actionSelect.value,
  )?.label;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full  justify-between rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow",
        "focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
        disabled && "cursor-not-allowed opacity-80",
        className,
      )}
    >
      {/* LEFT SIDE: Custom Search & Select (Maintains inline input behavior) */}
      <div className="relative flex w-full flex-1 items-center min-w-0">
        <div className="flex min-h-10 w-full items-center justify-between gap-2 px-2 py-1.5 text-sm">
          <ScrollArea
            onClick={() => {
              if (!disabled) inputRef.current?.focus();
            }}
            className={cn("grow")}
            viewportClassName="max-h-16"
          >
            <div className="flex flex-wrap items-center gap-1">
              {/* Selected Items */}
              {selectedItems.map((item) => (
                <Badge key={item.id} variant="outline" className="flex items-center pl-2.5 pr-0">
                  <div className="flex flex-col">
                    <span className="max-w-32 truncate text-2xs">{item.userName}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon5"
                    className="rounded-full"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemRemove(item.id);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </Badge>
              ))}

              {/* Search Input (Trigger and Search at same place) */}
              <div className="relative min-w-32 flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  disabled={disabled}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedItems.length === 0 ? placeholder : ""}
                  className="h-5 w-full rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Dropdown Toggle for Left Side */}
          {!actionSelect && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="ml-1 h-6 w-6 shrink-0 p-0 hover:bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute top-full z-50 mt-1 h-fit w-full rounded-lg border bg-popover shadow-md">
            <div className="p-2">
              {isLoading && (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <LoadingSpinner className="mr-2 h-4 w-4 text-primary" />
                  Searching...
                </div>
              )}
              {isError && (
                <div className="p-4 text-center text-sm text-destructive">
                  Error loading results
                </div>
              )}
              {!isLoading && !isError && inputValue && filteredResults.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found for "{inputValue}"
                </div>
              )}
              {!isLoading && !isError && !inputValue && filteredResults.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
              {filteredResults.length > 0 ? (
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
                      <Avatar className={cn("flex h-7 w-7")}>
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

      {/* RIGHT SIDE: Action Select with Description Support */}
      {actionSelect && (
        <div className="shrink-0 border-l py-[1px] border-input">
          <Select
            disabled={disabled}
            value={actionSelect.value}
            onValueChange={actionSelect.onChange}
          >
            <SelectTrigger className="h-10 w-auto min-w-28 rounded-none border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
              <SelectValue>{optionLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {actionSelect.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{opt.label}</span>
                    {/* Render description if it exists */}
                    {opt.description && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
