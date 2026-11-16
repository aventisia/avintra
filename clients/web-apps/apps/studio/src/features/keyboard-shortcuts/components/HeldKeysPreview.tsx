import { KeyboardIcon } from "@phosphor-icons/react";

import { ALL_SHORTCUTS } from "../constants/shortcut-groups.constant";
import type { HeldKeys } from "../types/shortcut.type";
import { keyCaps, keyLabel, keyName } from "../utils/key-labels.util";
import { matchShortcut } from "../utils/shortcut-match.util";
import { Keycap } from "./Keycap";

const describeHeldKeys = (held: HeldKeys) => {
  const matches = ALL_SHORTCUTS.map((shortcut) => ({
    label: shortcut.label,
    match: matchShortcut(shortcut, held),
  }));
  const exactLabels = matches.filter(({ match }) => match === "exact").map(({ label }) => label);
  const partialCount = matches.filter(({ match }) => match === "partial").length;

  if (exactLabels.length) return { labels: exactLabels.slice(0, 2), isMatch: true };
  if (partialCount)
    return {
      labels: [`Part of ${partialCount} ${partialCount === 1 ? "shortcut" : "shortcuts"}`],
      isMatch: false,
    };
  return { labels: ["Not a Studio shortcut"], isMatch: false };
};

const IdleHint = () => (
  <p className="flex items-center gap-2.5 text-body-sm text-muted-foreground">
    <KeyboardIcon className="size-5 shrink-0" />
    Press a shortcut to look it up. It won&rsquo;t run while this window is open.
  </p>
);

const heldCaps = (held: HeldKeys) => [
  ...held.modifiers.map((modifier) => ({
    id: modifier,
    label: keyLabel(modifier),
    name: keyName(modifier),
  })),
  ...(held.key ? keyCaps(held.key).map((cap) => ({ id: `${held.key}-${cap.label}`, ...cap })) : []),
];

export const HeldKeysPreview = ({ held }: { held: HeldKeys }) => {
  const caps = heldCaps(held);
  const { labels, isMatch } = describeHeldKeys(held);

  return (
    <div
      aria-live="polite"
      className="flex h-[72px] items-center gap-4 rounded-lg bg-sunken/70 px-4 ring-1 ring-inset ring-line"
    >
      {caps.length ? (
        <>
          <span className="flex shrink-0 items-center gap-1.5">
            {caps.map((cap) => (
              <Keycap
                key={cap.id}
                size="lg"
                name={cap.name}
                className="duration-150 animate-in fade-in-0 zoom-in-75 motion-reduce:animate-none"
              >
                {cap.label}
              </Keycap>
            ))}
          </span>
          <span className="flex min-w-0 flex-col">
            {labels.map((label) => (
              <span
                key={label}
                className={
                  isMatch
                    ? "truncate text-body font-medium text-ink"
                    : "truncate text-body-sm text-muted-foreground"
                }
              >
                {label}
              </span>
            ))}
          </span>
        </>
      ) : (
        <IdleHint />
      )}
    </div>
  );
};
