import { cn } from "@avplatform/ui/lib";
import { Lock } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { FLOW_TYPE_OPTIONS } from "../../constants/flow-type-options.constant";

type FlowTypePickerProps = {
  selectedType: string;
  registration: UseFormRegisterReturn;
  isLocked: boolean;
};

/**
 * Agent type radio cards; locked to the stored type once the agent exists.
 */
export const FlowTypePicker = ({ selectedType, registration, isLocked }: FlowTypePickerProps) => {
  const options = isLocked
    ? FLOW_TYPE_OPTIONS.filter((option) => option.value === selectedType)
    : FLOW_TYPE_OPTIONS;

  return (
    <fieldset disabled={isLocked}>
      <legend className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-700">
        Type
        {isLocked && (
          <span className="flex items-center gap-1 font-normal text-slate-400">
            <Lock className="size-3" />
            Can’t be changed after creation
          </span>
        )}
      </legend>
      <div className="space-y-2">
        {options.map(({ value, label, description, icon: Icon }) => {
          const isSelected = value === selectedType;

          return (
            <label
              key={value}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 transition-[background-color,box-shadow] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-500",
                isLocked ? "cursor-default" : "cursor-pointer",
                isSelected
                  ? "bg-indigo-50/60 ring-[1.5px] ring-indigo-500"
                  : "bg-popover ring-1 ring-border hover:bg-slate-50/80 hover:ring-slate-300",
              )}
            >
              <input type="radio" value={value} {...registration} className="peer sr-only" />
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg ring-1",
                  isSelected
                    ? "bg-indigo-100/70 text-indigo-600 ring-indigo-600/15"
                    : "bg-slate-50 text-slate-500 ring-slate-900/[0.06]",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-slate-900">{label}</span>
                <span className="block truncate text-[12px] text-muted-foreground">
                  {description}
                </span>
              </span>
              {!isLocked && (
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-200",
                    isSelected
                      ? "bg-primary"
                      : "bg-popover shadow-[inset_0_0_0_1.5px_rgb(203,213,225)]",
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
