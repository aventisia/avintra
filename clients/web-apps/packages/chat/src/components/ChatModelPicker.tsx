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
import { Fragment } from "react";

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

/** Quiet composer chip that picks the model for the next message. */
export const ChatModelPicker = ({ groups, value, onChange }: ChatModelPickerProps) => {
  const label = groups.flatMap((group) => group.models).find((model) => model.key === value)?.label;
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
        <DropdownMenuRadioGroup
          value={value ?? AUTO}
          onValueChange={(key) => onChange(key === AUTO ? null : key)}
        >
          <DropdownMenuRadioItem value={AUTO} className="flex-col items-start gap-0">
            Auto
            <span className="text-xs text-muted-foreground">Your workspace default</span>
          </DropdownMenuRadioItem>
          {groups.map((group) => (
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
