import { ConfigStoreTypesEnum } from "@avplatform/ui/enums/config-store-types-enum";
import { cn } from "@avplatform/ui/lib";
import { getEnumValueByKey } from "@avplatform/ui/utils";
import { BracketsCurlyIcon, TextTIcon, ToggleLeftIcon } from "@phosphor-icons/react";
import type { UseFormRegisterReturn } from "react-hook-form";

const KEY_TYPE_META = {
  TEXT: { icon: TextTIcon, description: "A plain text value" },
  BOOLEAN: { icon: ToggleLeftIcon, description: "True or false" },
  JSON: { icon: BracketsCurlyIcon, description: "A structured JSON object" },
} as const;

type KeyTypePickerProps = {
  selectedType: string;
  registration: UseFormRegisterReturn;
  disabled: boolean;
};

/**
 * Key type radio cards; the name (not the type) is what locks once the key exists.
 */
export const KeyTypePicker = ({ selectedType, registration, disabled }: KeyTypePickerProps) => {
  const options = (Object.keys(ConfigStoreTypesEnum) as (keyof typeof ConfigStoreTypesEnum)[]).map(
    (key) => ({
      value: key,
      label: getEnumValueByKey(ConfigStoreTypesEnum, key),
      ...KEY_TYPE_META[key],
    }),
  );

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-1.5 text-[12.5px] font-semibold text-ink-2">Key type</legend>
      <div className="space-y-2">
        {options.map(({ value, label, description, icon: Icon }) => {
          const isSelected = value === selectedType;

          return (
            <label
              key={value}
              className={cn(
                "flex items-center gap-3 rounded-md px-3.5 py-3 transition-[background-color,box-shadow] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                disabled ? "cursor-default" : "cursor-pointer",
                isSelected
                  ? "bg-focus/[0.06] ring-1 ring-focus"
                  : "bg-popover ring-1 ring-border hover:bg-sunken/80 hover:ring-line-strong",
              )}
            >
              <input type="radio" value={value} {...registration} className="peer sr-only" />
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md ring-1",
                  isSelected
                    ? "bg-focus/[0.06] text-primary-text ring-focus/30"
                    : "bg-sunken text-muted-foreground ring-line",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">{label}</span>
                <span className="block truncate text-[12px] text-muted-foreground">
                  {description}
                </span>
              </span>
              {!disabled && (
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-200",
                    isSelected ? "bg-focus" : "bg-popover ring-[1.5px] ring-inset ring-line-strong",
                  )}
                >
                  {isSelected && <span className="size-1.5 rounded-full bg-popover" />}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
