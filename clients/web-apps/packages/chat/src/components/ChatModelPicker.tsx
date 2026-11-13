import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  MenuContent,
  MenuLabel,
  MenuSeparator,
} from "@avplatform/ui/dropdown-menu";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Fragment, useState } from "react";

/** A provider's models in the composer's model picker. */
export type ChatModelGroup = {
  label: string;
  models: readonly { key: string; label: string }[];
};

export type ChatModelPickerProps = {
  groups: readonly ChatModelGroup[];
  /** Selected model key, or null for Auto (the workspace default). */
  value: string | null;
  onChange: (key: string | null) => void;
};

const AUTO = "auto";

/** Above this many models the picker shows a search box. */
const SEARCH_THRESHOLD = 8;

/** Quiet composer chip that picks the model for the next message. */
export const ChatModelPicker = ({ groups, value, onChange }: ChatModelPickerProps) => {
  const [query, setQuery] = useState("");
  const allModels = groups.flatMap((group) => group.models);
  const label = allModels.find((model) => model.key === value)?.label;
  const needle = query.trim().toLowerCase();
  const visibleGroups = needle
    ? groups
        .map((group) => ({
          ...group,
          models: group.models.filter((model) => model.label.toLowerCase().includes(needle)),
        }))
        .filter((group) => group.models.length > 0)
    : groups;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Model: ${label ?? "Auto"}`}
        className="inline-flex h-8 min-w-0 max-w-48 items-center gap-1 rounded-full px-2.5 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-hover data-[state=open]:text-ink"
      >
        <span className="truncate">{label ?? "Auto"}</span>
        <CaretDownIcon weight="bold" className="size-3 shrink-0" />
      </DropdownMenuTrigger>
      <MenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
        {allModels.length > SEARCH_THRESHOLD && (
          <input
            type="search"
            aria-label="Search models"
            placeholder="Search models"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            // IMPORTANT NOTE: the menu's typeahead would steal these keystrokes; arrows and Enter still reach the menu.
            onKeyDown={(event) => {
              if (!["ArrowUp", "ArrowDown", "Enter", "Escape", "Tab"].includes(event.key)) {
                event.stopPropagation();
              }
            }}
            className="mb-1 h-8 w-full rounded-md border border-line bg-surface px-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-focus"
          />
        )}
        <DropdownMenuRadioGroup
          value={value ?? AUTO}
          onValueChange={(key) => onChange(key === AUTO ? null : key)}
        >
          {!needle && (
            <DropdownMenuRadioItem value={AUTO} className="flex-col items-start gap-0">
              Auto
              <span className="text-xs text-muted-foreground">Your workspace default</span>
            </DropdownMenuRadioItem>
          )}
          {needle && visibleGroups.length === 0 && (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              No models match “{query.trim()}”.
            </p>
          )}
          {visibleGroups.map((group) => (
            <Fragment key={group.label}>
              <MenuSeparator />
              <MenuLabel>{group.label}</MenuLabel>
              {group.models.map((model) => (
                <DropdownMenuRadioItem key={model.key} value={model.key}>
                  <span className="truncate">{model.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </Fragment>
          ))}
        </DropdownMenuRadioGroup>
      </MenuContent>
    </DropdownMenu>
  );
};
