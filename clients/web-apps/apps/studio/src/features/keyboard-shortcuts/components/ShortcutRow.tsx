import { cn } from "@avplatform/ui/lib";

import type { HeldKeys, Shortcut } from "../types/shortcut.type";
import { matchShortcut } from "../utils/shortcut-match.util";
import { ShortcutKeys } from "./ShortcutKeys";

type ShortcutRowProps = {
  shortcut: Shortcut;
  held: HeldKeys;
};

export const ShortcutRow = ({ shortcut, held }: ShortcutRowProps) => {
  const match = matchShortcut(shortcut, held);
  return (
    <li
      className={cn(
        "flex min-h-9 items-center justify-between gap-4 rounded-md px-2.5 py-1.5",
        "transition-[opacity,background-color] duration-150 motion-reduce:transition-none",
        match === "exact" && "bg-primary/10",
        match === "none" && "opacity-30",
      )}
    >
      <span className={cn("text-body-sm text-ink-2", match === "exact" && "font-medium text-ink")}>
        {shortcut.label}
      </span>
      <ShortcutKeys shortcut={shortcut} held={held} match={match} />
    </li>
  );
};
