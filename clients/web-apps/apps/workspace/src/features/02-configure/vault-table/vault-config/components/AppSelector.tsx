import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { FormLabelExt } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

// The most commonly used apps/services/providers, shown first in the "Popular" section.
const POPULAR_VALUES = new Set([
  "OpenAI",
  "AWS",
  "Twilio",
  "SendGrid",
  "GitHub",
  "M365",
  "GeneralCredentials",
  "GoogleGemini",
  "GoogleWorkspace",
  "ElevenLabs",
  "OpenRouter",
  "AzureStorage",
  "ConnectionString",
  "Qdrant",
  "Anthropic",
  "CustomApiTool",
  "Ollama",
  "OllamaCloud",
  "Groq",
  "Bedrock",
  "Mistral",
]);

const POPULAR_LIMIT = 21;

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

  // Sort options alphabetically by label (case-insensitive).
  const sortedOptions = useMemo(
    () =>
      [...options].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" })),
    [options],
  );

  // Filter options based on input value.
  const filteredResults = useMemo(
    () =>
      sortedOptions.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [sortedOptions, inputValue],
  );

  // Split into "Popular" (top 20) and "Others" (remaining), each sorted alphabetically.
  const { popularOptions, otherOptions } = useMemo(() => {
    const popular: AppOption[] = [];
    const others: AppOption[] = [];
    for (const option of filteredResults) {
      if (popular.length < POPULAR_LIMIT && POPULAR_VALUES.has(option.value)) {
        popular.push(option);
      } else {
        others.push(option);
      }
    }
    return { popularOptions: popular, otherOptions: others };
  }, [filteredResults]);

  const renderOption = (option: AppOption) => (
    <div
      key={option.value}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg py-2 pl-6 pr-2 transition-colors hover:bg-accent",
        isItemSelected(option.value) && "cursor-not-allowed opacity-50",
      )}
      onClick={() => !isItemSelected(option.value) && handleItemSelect(option)}
    >
      <div className="flex flex-col">
        <p className="truncate text-sm font-medium">{option.label}</p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div>
        <div className="mb-1">
          <FormLabelExt label="Select app or service" description="Select an app or service" />
        </div>
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
                {popularOptions.length > 0 && (
                  <>
                    <p className="px-2 pb-1 pt-1 text-xs font-semibold tracking-wide text-muted-foreground">
                      Popular
                    </p>
                    {popularOptions.map(renderOption)}
                  </>
                )}

                {otherOptions.length > 0 && (
                  <>
                    <p className="px-2 pb-1 pt-2 text-xs font-semibold tracking-wide text-muted-foreground">
                      Others
                    </p>
                    {otherOptions.map(renderOption)}
                  </>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
