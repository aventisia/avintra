import { cn } from "@avplatform/ui/lib";
import { LockIcon } from "@phosphor-icons/react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { AGENT_TYPES } from "../../constants/agent-attributes.constant";
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
    <fieldset disabled={isLocked} className="min-w-0">
      <legend className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-2">
        Type
        {isLocked && (
          <span className="flex items-center gap-1 font-normal text-muted-foreground">
            <LockIcon className="size-3" />
            Can’t be changed after creation
          </span>
        )}
      </legend>
      <div className="space-y-2">
        {options.map(({ value, label, description, icon: Icon }) => {
          const isSelected = value === selectedType;
          const tint = AGENT_TYPES.find((agentType) => agentType.value === value)?.tint;

          return (
            <label
              key={value}
              className={cn(
                "flex items-center gap-3 rounded-md px-3.5 py-3 transition-[background-color,box-shadow] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                isLocked ? "cursor-default" : "cursor-pointer",
                isSelected
                  ? "bg-focus/[0.06] ring-1 ring-focus"
                  : "bg-popover ring-1 ring-border hover:bg-sunken/80 hover:ring-line-strong",
              )}
            >
              <input type="radio" value={value} {...registration} className="peer sr-only" />
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md ring-1",
                  tint ??
                    (isSelected
                      ? "bg-focus/[0.06] text-primary-text ring-focus/30"
                      : "bg-sunken text-muted-foreground ring-line"),
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
              {!isLocked && (
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
