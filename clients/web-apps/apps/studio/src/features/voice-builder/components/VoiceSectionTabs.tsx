import { cn } from "@avplatform/ui/lib";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";

import { VOICE_BUILDER_SECTIONS } from "../constants/voice-builder.constant";
import type { VoiceReadinessCheck } from "../types/voice-builder.type";

/** Segmented section tabs, matching the node config panel, with a dot on tabs that still need input. */
export const VoiceSectionTabs = ({ readiness }: { readiness: VoiceReadinessCheck[] }) => (
  <div className="flex shrink-0 px-4 pt-4">
    <TabsList
      aria-label="Voice agent settings"
      className={cn(SEGMENTED_TABS_LIST_CLASS, "max-w-full overflow-x-auto [scrollbar-width:none]")}
    >
      {VOICE_BUILDER_SECTIONS.map(({ id, label, icon: Icon }) => {
        const pending = readiness.find((check) => check.section === id && !check.isReady);
        return (
          <TabsTrigger
            key={id}
            value={id}
            title={pending?.hint}
            className={cn(SEGMENTED_TABS_TRIGGER_CLASS, "shrink-0")}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {label}
            {pending && (
              <>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-warn" />
                <span className="sr-only">(to do: {pending.hint})</span>
              </>
            )}
          </TabsTrigger>
        );
      })}
    </TabsList>
  </div>
);
