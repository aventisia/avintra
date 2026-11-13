import { cn } from "@avplatform/ui/lib";
import type { Icon } from "@phosphor-icons/react";

export type VoiceOptionCard = {
  value: string;
  label: string;
  description: string;
  Icon: Icon;
};

type VoiceOptionCardsProps = {
  ariaLabel: string;
  value: string;
  options: readonly VoiceOptionCard[];
  onChange: (value: string) => void;
};

export const VoiceOptionCards = ({
  ariaLabel,
  value,
  options,
  onChange,
}: VoiceOptionCardsProps) => (
  <div role="radiogroup" aria-label={ariaLabel} className="grid gap-2 sm:grid-cols-2">
    {options.map(({ value: optionValue, label, description, Icon }) => (
      <button
        key={optionValue}
        type="button"
        role="radio"
        aria-checked={value === optionValue}
        onClick={() => onChange(optionValue)}
        className={cn(
          "flex items-start gap-3 rounded-lg border border-line px-3 py-3 text-left hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none",
          value === optionValue && "border-primary bg-selected hover:bg-selected",
        )}
      >
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-2" />
        <span>
          <span className="block text-body-sm font-semibold text-ink">{label}</span>
          <span className="block text-hint text-muted-foreground">{description}</span>
        </span>
      </button>
    ))}
  </div>
);
