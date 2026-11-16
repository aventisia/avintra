import { useCopyToClipboard } from "@avplatform/ui/hooks";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";

import { ChatIconButton } from "./ChatIconButton";

/** Copies fixed text and confirms with a check mark. */
export const ChatCopyButton = ({ text, label }: { text: string; label: string }) => {
  const { isCopied, copy } = useCopyToClipboard({ successDuration: 1500 });
  return (
    <ChatIconButton label={isCopied ? "Copied" : label} onClick={() => void copy(text)}>
      {isCopied ? <CheckIcon className="text-ok" /> : <CopyIcon />}
    </ChatIconButton>
  );
};
