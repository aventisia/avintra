import { SelectField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form";

import { SliderField } from "@/components/Slider/SliderField";

import { ConfigFieldCard } from "./ConfigFieldCard";

const MAX_TURNS = 50;
const TICKS = 25;

const MEMORY_PROVIDER_OPTIONS = [
  { label: "Memory provider 1", value: "Memory provider 1", description: "" },
  { label: "Memory provider 2", value: "Memory provider 2", description: "" },
];

interface MemoryConfigFieldProps {
  /** The name of the form field. */
  name: string;
  /** Renders the body without its card, for a host that frames it. */
  hideGroup?: boolean;
}

/** A strip of turn ticks filled up to the remembered count, so the window reads at a glance. */
const TurnWindow = ({ turns }: { turns: number }) => {
  const filled = Math.round((Math.min(turns, MAX_TURNS) / MAX_TURNS) * TICKS);
  return (
    <span aria-hidden="true" className="flex h-3 min-w-0 flex-1 items-end gap-[3px]">
      {Array.from({ length: TICKS }, (_, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 rounded-[1px] transition-[background-color,height] duration-150",
            index >= TICKS - filled
              ? "h-3 bg-[color-mix(in_srgb,var(--ai-magenta-text)_70%,var(--surface))]"
              : "h-1.5 bg-line-strong/40",
          )}
        />
      ))}
    </span>
  );
};

const MemoryConfigField = ({ name, hideGroup = false }: MemoryConfigFieldProps) => {
  const memoryProviderFieldName = `${name}.memoryProvider` as FieldPath<FieldValues>;
  const maxDataStoredFieldName = `${name}.maxDataStored` as FieldPath<FieldValues>;

  const { control } = useFormContext();
  const turns = Number(useWatch({ control, name: maxDataStoredFieldName }) ?? 0);

  const body = (
    <div className="space-y-2.5">
      <div className="hidden">
        <SelectField
          size="sm"
          name={memoryProviderFieldName}
          selectOptions={MEMORY_PROVIDER_OPTIONS}
          label="Memory provider"
        />
      </div>

      <SliderField
        label="Turns remembered"
        name={maxDataStoredFieldName}
        trackColor="bg-muted"
        min={0}
        max={MAX_TURNS}
        step={1}
        size="sm"
        formatValue={(value) => String(value)}
      />
      <div className="flex items-center gap-3">
        <TurnWindow turns={turns} />
        <p className="shrink-0 text-hint text-muted-foreground">
          {turns === 0 ? "Off: every turn starts fresh." : `Keeps the last ${turns} in mind.`}
        </p>
      </div>
    </div>
  );

  if (hideGroup) return body;

  return (
    <ConfigFieldCard
      Icon={ClockCounterClockwiseIcon}
      tone="magenta"
      label="Remembers"
      title="Short-term memory"
      description="Recent turns the agent keeps in mind while it replies."
    >
      {body}
    </ConfigFieldCard>
  );
};

MemoryConfigField.displayName = "MemoryConfigField";

export { MemoryConfigField, type MemoryConfigFieldProps };
