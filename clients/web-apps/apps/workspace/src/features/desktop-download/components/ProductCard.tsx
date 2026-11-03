import { CheckIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type ProductCardProps = {
  icon: ReactNode;
  audience: string;
  name: string;
  pitch: string;
  highlights: string[];
  details: string | null;
  action: ReactNode;
};

export const ProductCard = ({
  icon,
  audience,
  name,
  pitch,
  highlights,
  details,
  action,
}: ProductCardProps) => (
  <article className="flex flex-col rounded-lg border border-line bg-surface p-6">
    <div className="flex items-start justify-between gap-4">
      <span className="grid size-11 place-items-center rounded-lg bg-sunken text-ink-2 [&_svg]:size-5">
        {icon}
      </span>
      <span className="text-label uppercase text-muted-foreground">{audience}</span>
    </div>
    <h2 className="mt-5 text-heading text-ink">{name}</h2>
    <p className="mt-1.5 text-body-sm text-muted-foreground">{pitch}</p>
    <ul className="mt-5 space-y-2.5">
      {highlights.map((highlight) => (
        <li key={highlight} className="flex gap-2.5 text-body-sm text-ink-2">
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden="true" />
          {highlight}
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="font-mono text-hint tabular-nums text-muted-foreground">
          {details ?? "Not available yet"}
        </span>
        {action}
      </div>
    </div>
  </article>
);
