import { ScrollArea } from "@avplatform/ui/scroll";
import { TabsContent } from "@avplatform/ui/tabs";
import type { ReactNode } from "react";

import { VOICE_BUILDER_SECTION_META } from "../constants/voice-builder.constant";
import type { VoiceBuilderSectionId } from "../types/voice-builder.type";

type VoiceBuilderSectionProps = {
  id: VoiceBuilderSectionId;
  /** Section-specific action shown in the footer. */
  action?: ReactNode;
  /** Replaces the tab's description line. */
  intro?: ReactNode;
  children: ReactNode;
};

/** One settings tab: a scrolling body with the tab's description, then an optional footer action. */
export const VoiceBuilderSection = ({ id, action, intro, children }: VoiceBuilderSectionProps) => (
  <TabsContent
    value={id}
    className="mt-0 flex h-full min-h-0 flex-col data-[state=inactive]:hidden"
  >
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-4 px-5 pb-4 pt-3">
        {intro ?? (
          <p className="text-hint text-muted-foreground">
            {VOICE_BUILDER_SECTION_META[id].description}
          </p>
        )}
        {children}
      </div>
    </ScrollArea>
    {action && (
      <footer className="flex h-14 shrink-0 items-center gap-2 border-t border-line px-4">
        {action}
      </footer>
    )}
  </TabsContent>
);
