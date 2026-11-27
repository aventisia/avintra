import { cn } from "@avplatform/ui/lib";
import { GlobeIcon } from "@phosphor-icons/react";

import { ChatIconButton } from "./ChatIconButton";

export type ChatWebSearchToggleProps = {
  value: boolean;
  onChange: (next: boolean) => void;
};

/** Composer button that lets the model search the web for the next messages. */
export const ChatWebSearchToggle = ({ value, onChange }: ChatWebSearchToggleProps) => (
  <ChatIconButton
    label="Search the web"
    aria-pressed={value}
    onClick={() => onChange(!value)}
    className={cn(value && "bg-hover text-ink")}
  >
    <GlobeIcon weight={value ? "fill" : "regular"} />
  </ChatIconButton>
);
