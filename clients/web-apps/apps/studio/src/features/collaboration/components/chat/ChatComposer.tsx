import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";

import { ChatRecipient } from "./ChatRecipientSelect";

interface ChatComposerProps {
  recipient: ChatRecipient;
  onSend: (message: string, recipient: ChatRecipient) => void;
  className?: string;
}

/**
 * Renders the message input + send button for the live chat panel. Sending is disabled
 * until there is text and a recipient is selected.
 */
export const ChatComposer = ({ recipient, onSend, className }: ChatComposerProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, recipient);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2 border-t px-3 py-2.5", className)}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Message ${recipient.recipientUserId ? "this user" : "everyone"}…`}
        className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />
      <Button
        type="submit"
        size="icon8"
        variant="default"
        disabled={!text.trim()}
        className="h-8 w-8 shrink-0"
        aria-label="Send message"
      >
        <PaperAirplaneIcon className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
};
