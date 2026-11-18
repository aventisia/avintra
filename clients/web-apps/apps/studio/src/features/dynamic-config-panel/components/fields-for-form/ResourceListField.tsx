import { Button } from "@avplatform/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { IconTile, type IconTileTone } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import type { ISelectOption } from "@avplatform/ui/types";
import { CheckIcon, type Icon, PlusIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useController } from "react-hook-form";

type ResourceListFieldProps = {
  /** Form path holding the attached ids as a string array. */
  name: string;
  options: ISelectOption[];
  isLoading?: boolean;
  Icon: Icon;
  tone?: IconTileTone;
  /** Singular and plural nouns, such as ["knowledge base", "knowledge bases"]. */
  noun: [string, string];
  /** Line shown while nothing is attached. */
  emptyHint: string;
  disabled?: boolean;
};

/** Attached resources as a list of rows, with a searchable picker to attach or detach more. */
export const ResourceListField = ({
  name,
  options,
  isLoading = false,
  Icon,
  tone = "neutral",
  noun: [singular, plural],
  emptyHint,
  disabled,
}: ResourceListFieldProps) => {
  const { field } = useController({ name });
  const [isOpen, setIsOpen] = useState(false);

  const selected: string[] = Array.isArray(field.value) ? field.value : [];
  const optionByValue = new Map(options.map((option) => [option.value, option]));

  const toggle = (value: string) =>
    field.onChange(
      selected.includes(value) ? selected.filter((id) => id !== value) : [...selected, value],
    );

  const picker = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={selected.length ? "ghost" : "outline"}
          size="sm"
          disabled={disabled}
          className={cn(
            selected.length && "w-full justify-start rounded-none text-muted-foreground",
          )}
        >
          <PlusIcon aria-hidden="true" className="mr-1.5 size-3.5" />
          {selected.length ? `Attach another ${singular}` : `Attach ${singular}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-72 p-0">
        <Command>
          <CommandInput placeholder={`Search ${plural}`} />
          <CommandList className="max-h-64 border-t border-line">
            <CommandEmpty>{isLoading ? "Loading…" : `No ${plural} found.`}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => toggle(option.value)}
                    className="gap-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-line-strong bg-surface",
                      )}
                    >
                      {isSelected && <CheckIcon weight="bold" className="size-2.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-hint text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (!selected.length) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-line-strong/60 px-3 py-2.5">
        <p className="min-w-0 flex-1 text-hint text-muted-foreground">{emptyHint}</p>
        {picker}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-line">
      <ul aria-label={`Attached ${plural}`} className="divide-y divide-line">
        {selected.map((value) => {
          const option = optionByValue.get(value);
          const isMissing = !option && !isLoading;
          return (
            <li
              key={value}
              className="group/row flex items-center gap-3 px-3 py-2 animate-in fade-in duration-150"
            >
              <IconTile Icon={isMissing ? WarningIcon : Icon} tone={tone} size="xs" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-medium text-ink">
                  {option?.label ?? (isLoading ? "Loading…" : value)}
                </span>
                {isMissing ? (
                  <span className="block text-hint text-bad">
                    No longer available. Detach it or pick another.
                  </span>
                ) : (
                  option?.description && (
                    <span className="block truncate text-hint text-muted-foreground">
                      {option.description}
                    </span>
                  )
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon6"
                disabled={disabled}
                aria-label={`Detach ${option?.label ?? value}`}
                onClick={() => toggle(value)}
                className="text-muted-foreground opacity-60 hover:bg-bad/10 hover:text-bad group-hover/row:opacity-100 focus-visible:opacity-100"
              >
                <XIcon aria-hidden="true" className="size-3.5" />
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-line bg-sunken/50">{picker}</div>
    </div>
  );
};
