import { cn } from "@avplatform/ui/lib";
import { CursorClickIcon, HandGrabbingIcon, MouseScrollIcon } from "@phosphor-icons/react";

import type { Gesture, HeldKeys, Shortcut, ShortcutMatch } from "../types/shortcut.type";
import { keyCaps, keyLabel, keyName, resolveModifiers } from "../utils/key-labels.util";
import { NO_KEYS_HELD } from "../utils/shortcut-match.util";
import { Keycap } from "./Keycap";

const GESTURES = {
  click: { Icon: CursorClickIcon, label: "click" },
  drag: { Icon: HandGrabbingIcon, label: "drag" },
  scroll: { Icon: MouseScrollIcon, label: "scroll" },
} as const;

const ARROW_CLUSTER = [
  { key: "arrowup", position: "col-start-2" },
  { key: "arrowleft", position: "col-start-1 row-start-2" },
  { key: "arrowdown", position: "col-start-2 row-start-2" },
  { key: "arrowright", position: "col-start-3 row-start-2" },
];

const ArrowCluster = ({ pressedKey }: { pressedKey: string | null }) => (
  <span className="grid grid-cols-[repeat(3,18px)] grid-rows-[repeat(2,18px)] gap-0.5">
    {ARROW_CLUSTER.map(({ key, position }) => (
      <Keycap
        key={key}
        size="xs"
        name={keyName(key)}
        isPressed={pressedKey === key}
        className={position}
      >
        {keyLabel(key)}
      </Keycap>
    ))}
  </span>
);

const GestureChip = ({ gesture, isReady }: { gesture: Gesture; isReady: boolean }) => {
  const { Icon, label } = GESTURES[gesture];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-dashed border-line-strong/60 pl-1.5 pr-2 text-[11.5px] font-medium leading-none text-muted-foreground",
        "transition-colors duration-100 motion-reduce:transition-none",
        isReady && "border-primary/60 bg-primary/10 text-primary-text",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
};

type ShortcutKeysProps = {
  shortcut: Shortcut;
  held: HeldKeys;
  match: ShortcutMatch;
};

export const ShortcutKeys = ({ shortcut, held, match }: ShortcutKeysProps) => {
  const pressed = match === "none" ? NO_KEYS_HELD : held;
  return (
    <span className="flex shrink-0 items-center gap-1">
      {resolveModifiers(shortcut.modifiers).map((modifier) => (
        <Keycap
          key={modifier}
          name={keyName(modifier)}
          isPressed={pressed.modifiers.includes(modifier)}
        >
          {keyLabel(modifier)}
        </Keycap>
      ))}
      {shortcut.key === "arrows" ? <ArrowCluster pressedKey={pressed.key} /> : null}
      {shortcut.key && shortcut.key !== "arrows"
        ? keyCaps(shortcut.key).map((cap) => (
            <Keycap key={cap.label} name={cap.name} isPressed={pressed.key === shortcut.key}>
              {cap.label}
            </Keycap>
          ))
        : null}
      {shortcut.gesture ? (
        <GestureChip gesture={shortcut.gesture} isReady={match === "exact"} />
      ) : null}
    </span>
  );
};
