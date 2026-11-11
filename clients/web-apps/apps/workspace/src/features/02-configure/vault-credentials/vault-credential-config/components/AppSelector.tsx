import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { FormLabelExt, crudDialogFieldClasses } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { getVaultCredentialAppIcon } from "../constants/vault-credential-app-icon-mapper.constant";

type AppOption = {
  label: string;
  value: string;
};

type AppSelectorProps = {
  options: AppOption[];
  selectedItem: AppOption | null;
  onItemSelect: (item: AppOption) => void;
  placeholder?: string;
  defaultOpen?: boolean;
};

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

const BASE_PATH = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");
const FALLBACK_ICON = `${BASE_PATH}/brand-img/default-provider.svg`;

const AppIcon = ({ value }: { value: string }) => (
  <img
    src={BASE_PATH + (getVaultCredentialAppIcon(value) ?? "/brand-img/default-provider.svg")}
    alt=""
    className="size-4 shrink-0 object-contain"
    onError={(event) => {
      event.currentTarget.src = FALLBACK_ICON;
    }}
  />
);

/** Searchable app or service picker for a new vault credential. */
export const AppSelector = ({
  options,
  selectedItem,
  onItemSelect,
  placeholder = "Select an app or service",
  defaultOpen = false,
}: AppSelectorProps) => {
  const [open, setOpen] = useState(defaultOpen);

  const { popularOptions, otherOptions } = useMemo(() => {
    const sorted = [...options].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
    return {
      popularOptions: sorted.filter((option) => POPULAR_VALUES.has(option.value)),
      otherOptions: sorted.filter((option) => !POPULAR_VALUES.has(option.value)),
    };
  }, [options]);

  const renderOption = (option: AppOption) => {
    const isSelected = selectedItem?.value === option.value;
    return (
      <CommandItem
        key={option.value}
        value={`${option.label} ${option.value}`}
        onSelect={() => {
          if (!isSelected) onItemSelect(option);
          setOpen(false);
        }}
        className="gap-2.5"
      >
        <AppIcon value={option.value} />
        <span className="flex-1 truncate">{option.label}</span>
        <CheckIcon className={cn("size-3.5", isSelected ? "opacity-100" : "opacity-0")} />
      </CommandItem>
    );
  };

  return (
    <div className="space-y-1.5">
      <FormLabelExt
        label="App or service"
        description="The app or service this credential connects to. It cannot be changed after creation."
      />
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full items-center justify-between gap-2.5 rounded-md text-left outline-none",
              crudDialogFieldClasses.selectTrigger,
            )}
          >
            {selectedItem ? (
              <span className="flex min-w-0 items-center gap-2.5 text-ink">
                <AppIcon value={selectedItem.value} />
                <span className="truncate">{selectedItem.label}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <CaretUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-1.5 shadow-pop"
        >
          <Command>
            <div className="mb-1 rounded-md bg-sunken">
              <CommandInput className="h-9 text-sm" placeholder="Search apps" autoFocus />
            </div>
            <CommandList className="max-h-72">
              <CommandEmpty>No apps found.</CommandEmpty>
              {popularOptions.length > 0 && (
                <CommandGroup heading="Popular">{popularOptions.map(renderOption)}</CommandGroup>
              )}
              {otherOptions.length > 0 && (
                <CommandGroup heading="All apps">{otherOptions.map(renderOption)}</CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
