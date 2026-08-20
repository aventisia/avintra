import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            "rounded p-0.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-primary",
            className,
          )}
        >
          <InformationCircleIcon className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={6}
        align="start"
        className="z-50 w-64 rounded-lg border bg-popover p-2 text-xs leading-relaxed text-popover-foreground shadow-md outline-none"
      >
        <div className="prose prose-sm max-w-none break-words dark:prose-invert [&_*]:text-xs [&_code]:break-all [&_code]:whitespace-pre-wrap [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:my-1 [&_h2]:my-1 [&_h3]:my-1 [&_h4]:my-1 [&_h5]:my-1 [&_h6]:my-1 [&_blockquote]:my-1 [&_pre]:my-1 [&_code]:text-xs">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { FieldHelpPopover };
