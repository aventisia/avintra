import { cn } from "@avplatform/ui/lib";
import type { UseFormRegisterReturn } from "react-hook-form";

import { INPUT_TYPE_OPTIONS } from "../constants/input-type-options.constant";

type InputTypePickerProps = {
  selectedValue: string;
  registration: UseFormRegisterReturn;
};

/**
 * Segmented radio switch for the kind of control an input renders as.
 */
export const InputTypePicker = ({ selectedValue, registration }: InputTypePickerProps) => (
  <fieldset className="min-w-0">
    <legend className="mb-1.5 text-[12.5px] font-semibold text-ink-2">Field type</legend>
    <div className="grid h-8 grid-cols-4 rounded-lg border border-line bg-fill dark:bg-sunken">
      {INPUT_TYPE_OPTIONS.map(({ value, title, Icon }) => {
        const isSelected = value === selectedValue;

        return (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-1.5 rounded-[7px] border text-[12.5px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-focus",
              isSelected
                ? "border-line-strong/40 bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)] dark:bg-fill"
                : "border-transparent text-muted-foreground hover:text-ink",
            )}
          >
            <input type="radio" value={value} {...registration} className="sr-only" />
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{title}</span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
