import { AuiIf, ComposerPrimitive } from "@assistant-ui/react";
import { ArrowUpIcon, SquareIcon } from "@phosphor-icons/react";

const roundButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-95";

/** Auto-growing message box: Enter sends, Shift+Enter adds a line, Escape stops a reply. */
export const ChatComposer = ({ placeholder }: { placeholder: string }) => (
  <ComposerPrimitive.Root className="flex w-full flex-col rounded-[1.375rem] border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.18)] transition-[border-color,box-shadow] focus-within:border-line-strong dark:bg-surface dark:shadow-[0_0_0_1px_rgb(255_255_255/0.02),0_16px_40px_-20px_rgb(0_0_0/0.8)]">
    <ComposerPrimitive.Input
      rows={1}
      autoFocus
      placeholder={placeholder}
      aria-label="Message"
      className="max-h-[min(40vh,18rem)] min-h-[3.25rem] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-base leading-6 text-ink outline-none placeholder:text-muted-foreground"
    />
    <div className="flex items-center justify-end gap-2 px-3 pb-3">
      <AuiIf condition={(s) => !s.thread.isRunning}>
        <ComposerPrimitive.Send
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
  </ComposerPrimitive.Root>
);
