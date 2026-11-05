import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

// Props for the TimezoneSelector component
export interface AppOption {
  label: string;
  value: string;
}

interface TimezoneSelectorProps {
  options: AppOption[];
  selectedItem: AppOption | null;
  onItemSelect: (item: AppOption) => void;
  onItemClear: () => void;
  placeholder?: string;
  autoFocus?: boolean; // TODO: We should extend React.InputHTMLAttributes<HTMLInputElement> or similar to support other input props
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={isOpen ? inputValue : selectedItem ? selectedItem?.label : ""}
            autoFocus={autoFocus}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={selectedItem && isOpen ? selectedItem?.label : placeholder}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon7"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <CaretUpIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <CaretDownIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-line bg-surface shadow-pop">
          <div className="p-2">
            {inputValue && filteredResults.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{inputValue}"
              </div>
            )}

            {filteredResults.length > 0 && (
              <ScrollArea className="h-[50vh]">
                {filteredResults.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-hover",
                      isItemSelected(option.value) && "cursor-not-allowed opacity-50",
                    )}
                    onClick={() => !isItemSelected(option.value) && handleItemSelect(option)}
                  >
                    <div className="flex flex-col">
                      <p className="truncate text-sm font-medium">{option.label}</p>
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
