import type { ReactNode } from "react";

import type { VoiceBuilderSectionId } from "../types/voice-builder.type";
import { getVoiceSectionElementId } from "../utils/voice-builder.util";

type VoiceBuilderSectionProps = {
  id: VoiceBuilderSectionId;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export const VoiceBuilderSection = ({
  id,
  title,
  description,
  action,
  children,
}: VoiceBuilderSectionProps) => (
  <section
    id={getVoiceSectionElementId(id)}
    aria-labelledby={`${getVoiceSectionElementId(id)}-title`}
    className="scroll-mt-4 rounded-xl border border-line bg-surface"
  >
    <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 id={`${getVoiceSectionElementId(id)}-title`} className="text-heading text-ink">
          {title}
        </h2>
        <p className="text-hint text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
    <div className="space-y-4 px-5 py-4">{children}</div>
  </section>
);
