import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@aventisia/ui/buttons";
import { Input, LoadingSpinner } from "@aventisia/ui";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormLabelExt } from "@aventisia/ui/form";
import { ModelsListDto } from "../dtos/models-list-dto";

// Props for the ModelSelector component
interface ModelSelectorProps {
  searchResults: ModelsListDto[];
  selectedItem: ModelsListDto | null;
  onItemSelect: (item: ModelsListDto) => void;
  onItemClear: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  placeholder?: string;
  maxHeight?: string;
}

// Component to search and select an agent from a list
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  searchResults,
  selectedItem,
  onItemSelect,
  onSearchChange,
  isLoading,
  isError,
  placeholder = "Search and select item...",
}) => {
  // Dropdown visibility state
  const [isOpen, setIsOpen] = useState(false);
  // Local input state
  const [inputValue, setInputValue] = useState("");

  // Refs to detect outside clicks and focus
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
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

  // Update input and trigger search when user types
  const handleInputChange = (value: string) => {
    setInputValue(value);
    onSearchChange(value);
  };

  // Handle item selection from the list
  const handleItemSelect = (item: ModelsListDto) => {
    onItemSelect(item);
    setInputValue(""); // Clear input after selection
    onSearchChange(""); // Reset search
    setIsOpen(false); // Close dropdown
  };

  // Open dropdown on focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Check if an item is already selected
  const isItemSelected = (id: string) => {
    return selectedItem?.id === id;
  };

  // Filter out the selected item from the results
  const filteredResults = searchResults.filter(
    (result) => result.id !== selectedItem?.id,
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label and Input */}
      <div>
        <div className="mb-1">
          <FormLabelExt label="Select Model" description="Select an model" />
        </div>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={
              isOpen
                ? inputValue // Show input while typing
                : selectedItem
                  ? `${selectedItem.name}` // Show selected item when closed
                  : ""
            }
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={
              selectedItem && isOpen ? `${selectedItem.name}` : placeholder
            }
          />

          {/* Toggle Button for Dropdown */}
          <Button
            type="button"
            variant="ghost"
            size="icon7"
            className="absolute right-2 top-1.5"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white shadow">
          <div className="p-2">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <LoadingSpinner className="mr-2 h-4 w-4 text-primary" />
                Searching...
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="p-4 text-center text-sm text-red-600">
                Error loading results
              </div>
            )}

            {/* No results found */}
            {!isLoading &&
              !isError &&
              inputValue &&
              filteredResults.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found for "{inputValue}"
                </div>
              )}

            {/* Prompt to start typing */}
            {!isLoading && !isError && !inputValue && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Start typing to search...
              </div>
            )}

            {/* List of Search Results */}
            {filteredResults?.length > 0 && (
              <ScrollArea className="h-52">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent",
                      isItemSelected(result?.id) &&
                        "cursor-not-allowed opacity-50",
                    )}
                    onClick={() =>
                      !isItemSelected(result?.id) && handleItemSelect(result)
                    }
                  >
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">
                        {`${result.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
