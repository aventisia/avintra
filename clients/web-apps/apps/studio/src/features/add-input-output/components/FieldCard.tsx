import { TrashIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type FieldCardProps = {
  heading: string;
  name: string;
  onRemove: () => void;
  children: ReactNode;
};

/**
 * One input or output field: its position and name with a remove button, above its settings.
 */
export const FieldCard = ({ heading, name, onRemove, children }: FieldCardProps) => (
  <li className="rounded-md bg-popover ring-1 ring-line">
    <div className="flex items-center gap-2 border-b border-line bg-sunken/70 py-1.5 pl-3.5 pr-1.5">
      <span className="shrink-0 font-mono text-label uppercase text-muted-foreground">
        {heading}
      </span>
      {name && <span className="min-w-0 truncate font-mono text-[12px] text-ink-2">{name}</span>}
      <button
        type="button"
        aria-label={`Remove ${heading.toLowerCase()}`}
        onClick={onRemove}
        className="ml-auto grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus"
      >
        <TrashIcon className="size-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-1 gap-3.5 p-3.5 xs:grid-cols-2">{children}</div>
  </li>
);
