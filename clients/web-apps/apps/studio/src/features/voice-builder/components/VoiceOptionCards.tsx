import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import type { Icon } from "@phosphor-icons/react";
import { type ReactNode, useId } from "react";

export type VoiceOption = {
  value: string;
  label: string;
  description: string;
  Icon: Icon;
};

type VoiceOptionCardsProps = {
  legend: ReactNode;
  value: string;
  options: readonly VoiceOption[];
  onChange: (value: string) => void;
  /** Extra content at each card's right, such as a glyph of what the option runs. */
  renderTrailing?: (value: string, isSelected: boolean) => ReactNode;
};

/** A radio group drawn as option cards: a glyph tile, a label, and a one-line description each. */
export const VoiceOptionCards = ({
  legend,
  value,
  options,
  onChange,
  renderTrailing,
}: VoiceOptionCardsProps) => {
  const name = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(({ value: optionValue, label, description, Icon }) => {
          const isSelected = optionValue === value;
          return (
            <label
              key={optionValue}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors duration-150 has-[:focus-visible]:[outline-style:solid] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                isSelected
                  ? "border-primary bg-[color-mix(in_srgb,var(--primary-base)_5%,var(--surface))] shadow-[inset_0_0_0_1px_var(--primary-base)]"
                  : "border-line-strong/40 bg-surface hover:bg-hover",
              )}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={isSelected}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />
              <IconTile
                Icon={Icon}
                className={cn("transition-colors duration-150", isSelected && "text-primary-text")}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-body-sm font-semibold text-ink">{label}</span>
                <span className="block text-hint text-muted-foreground">{description}</span>
              </span>
              {renderTrailing?.(optionValue, isSelected)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
