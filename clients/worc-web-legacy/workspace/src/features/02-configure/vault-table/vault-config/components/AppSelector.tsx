import { Input } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Props for the AppSelector component
export interface AppOption {
  label: string;
  value: string;
}

interface AppSelectorProps {
  options: AppOption[];
  selectedItem: AppOption | null;
  onItemSelect: (item: AppOption) => void;
  onItemClear: () => void;
  placeholder?: string;
  autoFocus?: boolean; // TODO: We should extend React.InputHTMLAttributes<HTMLInputElement> or similar to support other input props
}

export const AppSelector: React.FC<AppSelectorProps> = ({
  options,
  selectedItem,
  onItemSelect,
  // onItemClear,
  placeholder = "Search and select item...",
  autoFocus = false,
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
  };

  const handleItemSelect = (item: AppOption) => {
    onItemSelect(item);
    setInputValue("");
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const isItemSelected = (value: string) => {
    return selectedItem?.value === value;
  };

  // Filter options based on input value
  const filteredResults = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div>
        <div className="mb-1">
          <FormLabelExt
            label="Select app or service"
            description="Select an app or service"
          />
        </div>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={
              isOpen ? inputValue : selectedItem ? selectedItem?.label : ""
            }
            autoFocus={autoFocus}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={
              selectedItem && isOpen ? selectedItem?.label : placeholder
            }
          />

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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white shadow">
          <div className="p-2">
            {inputValue && filteredResults.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{inputValue}"
              </div>
            )}

            {filteredResults.length > 0 && (
              <ScrollArea>
                {filteredResults.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent",
                      isItemSelected(option.value) &&
                        "cursor-not-allowed opacity-50",
                    )}
                    onClick={() =>
                      !isItemSelected(option.value) && handleItemSelect(option)
                    }
                  >
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">
                        {option.label}
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
