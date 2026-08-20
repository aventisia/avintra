import { buttonVariants } from "@avplatform/ui/buttons";
import { Popover, PopoverContent, PopoverDefaultHeader } from "@avplatform/ui/popover";
import { ScrollArea } from "@avplatform/ui/scroll";
import { ExternalLinkIcon } from "lucide-react";

import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { getGuide } from "@/docs-content";

interface HelpPopoverProps {
  /** Guide id to display (see `src/docs-content/registry.ts`). */
  guideId: string;
  /** Controlled open state. */
  open: boolean;
  /** Callback fired when the popover is requested to close. */
  onOpenChange: (open: boolean) => void;
  /** The trigger element that opens the popover. */
  children: React.ReactNode;
}

/**
 * Renders a single help guide in a popover using the existing MarkdownViewer.
 * Includes a "View full docs" link when the guide has a `docsSiteUrl`.
 */
const HelpPopover = ({ guideId, open, onOpenChange, children }: HelpPopoverProps) => {
  const guide = getGuide(guideId);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {children}
      <PopoverContent className="w-[28rem] max-w-[calc(100vw-2rem)]">
        <PopoverDefaultHeader heading={guide ? guide.title : "Help"} />
        {guide ? (
          <ScrollArea viewportClassName="max-h-[60vh]" className="px-4 py-3">
            <MarkdownViewer textValue={guide.content} compact />
          </ScrollArea>
        ) : (
          <p className="px-4 py-3 text-sm text-muted-foreground">
            No help content is available for this item yet.
          </p>
        )}
        {guide?.docsSiteUrl ? (
          <div className="border-t px-4 py-2.5">
            <a
              href={guide.docsSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View full docs
            </a>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

export { HelpPopover };
