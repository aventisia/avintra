import { cn } from "@avplatform/ui/lib";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ACCESS_LEVEL_OPTIONS } from "../constants/access-level-options.constant";

type AccessLevelPickerProps = {
  selectedValue: string;
  registration: UseFormRegisterReturn;
};

/**
 * Access level radio cards: who can use the template once it is approved.
 */
export const AccessLevelPicker = ({ selectedValue, registration }: AccessLevelPickerProps) => (
  <fieldset className="min-w-0">
    <legend className="mb-1.5 text-[12.5px] font-semibold text-ink-2">Access level</legend>
    <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
      {ACCESS_LEVEL_OPTIONS.map(({ value, title, description, Icon }) => {
        const isSelected = value === selectedValue;

        return (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer flex-col gap-3 rounded-md p-3.5 transition-[background-color,box-shadow] duration-200 has-[:disabled]:cursor-default has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              isSelected
                ? "bg-focus/[0.06] ring-1 ring-focus"
                : "bg-popover ring-1 ring-border hover:bg-sunken/80 hover:ring-line-strong",
            )}
          >
            <input type="radio" value={value} {...registration} className="sr-only" />
            <span className="flex items-center justify-between">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-md bg-sunken ring-1 ring-line",
                  isSelected ? "text-primary-text" : "text-ink-2",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-200",
                  isSelected ? "bg-focus" : "bg-popover ring-[1.5px] ring-inset ring-line-strong",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full bg-popover transition-transform duration-200",
                    isSelected ? "scale-100" : "scale-0",
                  )}
                />
              </span>
            </span>
            <span>
              <span className="block text-[13px] font-semibold text-ink">{title}</span>
              <span className="mt-0.5 block text-[12px] leading-[18px] text-muted-foreground">
                {description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
