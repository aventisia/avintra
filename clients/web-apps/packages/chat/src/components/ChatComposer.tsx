import { AuiIf, ComposerPrimitive, useAui, useAuiEvent, useAuiState } from "@assistant-ui/react";
import { ArrowUpIcon, PaperclipIcon, SquareIcon } from "@phosphor-icons/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useState,
} from "react";

import { CHAT_ATTACHMENT_LIMIT } from "../utils/chat-attachment-adapter.util";
import { ChatAttachment } from "./ChatAttachment";
import { ChatIconButton } from "./ChatIconButton";
import { ChatVoiceInput } from "./ChatVoiceInput";

type ChatComposerProps = {
  placeholder: string;
  inputRef: RefObject<HTMLTextAreaElement>;
  /** Controls placed after the attach button, such as a model picker. */
  tools?: ReactNode;
  /** Turns a voice recording into text; the microphone is hidden without it. */
  transcribe?: (audio: Blob) => Promise<string>;
};

const UNSUPPORTED_FILE = "That file type isn't supported. Attach images, PDFs or text files.";

const roundButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95";

/**
 * Auto-growing message box that takes dropped, pasted or picked files. Enter
 * sends, Shift+Enter adds a line, Escape stops a reply, ↑ in an empty box
 * recalls the last message, and the microphone dictates when transcription is given.
 */
export const ChatComposer = ({ placeholder, inputRef, tools, transcribe }: ChatComposerProps) => {
  const aui = useAui();
  const attachmentCount = useAuiState((s) => s.composer.attachments.length);
  const isOverLimit = attachmentCount > CHAT_ATTACHMENT_LIMIT;
  const [attachmentError, setAttachmentError] = useState<string>();
  useAuiEvent("composer.attachmentAdd", () => {
    setAttachmentError(undefined);
    inputRef.current?.focus();
  });
  useAuiEvent("composer.attachmentAddError", ({ reason, message }) =>
    setAttachmentError(reason === "adapter-error" ? message : UNSUPPORTED_FILE),
  );
  useAuiEvent("composer.send", () => setAttachmentError(undefined));
  const notice = isOverLimit
    ? `Attach up to ${CHAT_ATTACHMENT_LIMIT} files per message. Remove ${attachmentCount - CHAT_ATTACHMENT_LIMIT} to send.`
    : attachmentError;

  const blockSendOverLimit = (event: FormEvent) => {
    if (isOverLimit) event.preventDefault();
  };

  const recallLastMessage = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "ArrowUp" || event.currentTarget.value !== "") return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const lastUserMessage = aui.thread
      .getState()
      .messages.filter((message) => message.role === "user")
      .at(-1);
    const text = lastUserMessage?.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("\n")
      .trim();
    if (!text) return;
    event.preventDefault();
    aui.composer.setText(text);
  };

  return (
    <ComposerPrimitive.Root onSubmit={blockSendOverLimit} className="w-full">
      <ComposerPrimitive.AttachmentDropzone className="flex w-full flex-col rounded-[1.375rem] border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.18)] transition-[border-color,box-shadow] focus-within:border-line-strong data-[dragging=true]:border-primary data-[dragging=true]:ring-4 data-[dragging=true]:ring-primary/15 dark:bg-surface dark:shadow-[0_0_0_1px_rgb(255_255_255/0.02),0_16px_40px_-20px_rgb(0_0_0/0.8)]">
        <AuiIf condition={(s) => s.composer.attachments.length > 0}>
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            <ComposerPrimitive.Attachments>
              {() => <ChatAttachment />}
            </ComposerPrimitive.Attachments>
          </div>
        </AuiIf>
        <ComposerPrimitive.Input
          ref={inputRef}
          rows={1}
          autoFocus
          placeholder={placeholder}
          aria-label="Message"
          onKeyDown={recallLastMessage}
          className="max-h-[min(40vh,18rem)] min-h-[3.25rem] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-base leading-6 text-ink outline-none placeholder:text-muted-foreground"
        />
        {notice && (
          <p role="alert" className="px-5 pb-1 text-sm text-bad">
            {notice}
          </p>
        )}
        <div className="flex items-center gap-1 px-3 pb-3">
          <ComposerPrimitive.AddAttachment asChild>
            <ChatIconButton
              label={`Attach up to ${CHAT_ATTACHMENT_LIMIT} images, PDFs or text files (10 MB each)`}
              className="size-9 rounded-full"
            >
              <PaperclipIcon />
            </ChatIconButton>
          </ComposerPrimitive.AddAttachment>
          {tools}
          <div className="ml-auto flex items-center gap-1">
            {transcribe && <ChatVoiceInput transcribe={transcribe} />}
            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send
                disabled={isOverLimit}
                aria-label="Send message"
                className={`${roundButtonClass} bg-primary text-white hover:bg-primary-hover disabled:pointer-events-none disabled:bg-fill disabled:text-muted-foreground`}
              >
                <ArrowUpIcon weight="bold" className="size-4" />
              </ComposerPrimitive.Send>
            </AuiIf>
            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel
                aria-label="Stop generating"
                className={`${roundButtonClass} bg-ink text-surface hover:bg-ink-2`}
              >
                <SquareIcon weight="fill" className="size-3.5" />
              </ComposerPrimitive.Cancel>
            </AuiIf>
          </div>
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};
