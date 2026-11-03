import { InfoIcon } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ScrollArea } from "@/ui/components/scroll";
import { cn } from "@/ui/lib";

interface FieldHelpPopoverProps {
  /** Markdown content to render in the popover. */
  content: string;
  /** Optional className for the trigger icon. */
  className?: string;
}

/**
 * A small "i" icon that opens a popover rendering the given Markdown content.
 * Used next to form field labels to explain how to fill in the field.
 */
const FieldHelpPopover = ({ content, className }: FieldHelpPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Field help"
          className={cn(
            "rounded-sm p-0.5 text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:shadow-focus",
            className,
          )}
        >
          <InfoIcon className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          side="right"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          className="z-50 max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[var(--radix-popover-content-available-width)] overflow-hidden rounded-lg border bg-popover text-xs leading-relaxed text-popover-foreground shadow-pop outline-none"
        >
          {/*
            IMPORTANT NOTE: the `[&>div]:!block [&>div]:!w-full` classes on the
            ScrollArea viewport override Radix's internal `display:table` content
            wrapper. Without them, long content breaks out horizontally. Re-verify
            after upgrading @radix-ui/react-scroll-area.
          */}
          <ScrollArea viewportClassName="max-h-[var(--radix-popover-content-available-height)] [&>div]:!block [&>div]:!w-full">
            <div className="prose prose-sm min-w-0 max-w-none break-words p-2 dark:prose-invert [&_*]:text-xs [&_code]:break-all [&_code]:whitespace-pre-wrap [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:my-1 [&_h2]:my-1 [&_h3]:my-1 [&_h4]:my-1 [&_h5]:my-1 [&_h6]:my-1 [&_blockquote]:my-1 [&_pre]:my-1 [&_code]:text-xs">
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
          </ScrollArea>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export { FieldHelpPopover };
