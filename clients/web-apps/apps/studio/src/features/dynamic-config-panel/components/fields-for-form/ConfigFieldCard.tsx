import { IconTile, type IconTileTone } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import type { Icon } from "@phosphor-icons/react";
import { type ReactNode, useId } from "react";

type ConfigFieldCardProps = {
  Icon: Icon;
  tone?: IconTileTone;
  /** Short mono word beside the title, such as "Knows". */
  label: string;
  title: string;
  description?: string;
  /** Content at the header's right, such as a count or a switch. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** A titled card that frames one agent capability in the node config panel, in the Ink stage style. */
export const ConfigFieldCard = ({
  Icon,
  tone = "neutral",
  label,
  title,
  description,
  aside,
  className,
  children,
}: ConfigFieldCardProps) => {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-3.5 transition-colors duration-150 focus-within:border-[color-mix(in_srgb,var(--primary-base)_35%,var(--line))]",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <IconTile Icon={Icon} tone={tone} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="flex items-baseline gap-2">
            <span className="font-mono text-label uppercase text-muted-foreground">{label}</span>
            <span className="truncate text-body-sm font-semibold text-ink">{title}</span>
          </h3>
          {description && <p className="mt-0.5 text-hint text-muted-foreground">{description}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
};

/** Mono count chip for a card header, such as "2 attached". */
export const ConfigFieldCount = ({ count, noun }: { count: number; noun: string }) => (
  <span
    className={cn(
      "flex h-6 shrink-0 items-center rounded-sm border px-2 font-mono text-label uppercase",
      count > 0
        ? "border-[color-mix(in_srgb,var(--primary-base)_30%,transparent)] text-primary-text"
        : "border-line text-muted-foreground",
    )}
  >
    {count} {noun}
  </span>
);
