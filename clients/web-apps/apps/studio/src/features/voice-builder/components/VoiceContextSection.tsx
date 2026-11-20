import type { IconTileTone } from "@avplatform/ui/icon-tile";
import {
  BookOpenTextIcon,
  ClockCounterClockwiseIcon,
  type Icon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";

import {
  KnowledgeBaseConfigField,
  MemoryConfigField,
  SkillsConfigField,
} from "@/features/dynamic-config-panel";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceStage } from "./VoiceStage";
import { VoiceTabHeading } from "./VoiceTabHeading";

type VoiceContextSectionProps = {
  /** Whether the voice node's config offers this field, so a stage shows only when it can save. */
  hasField: (name: string) => boolean;
};

type ContextStage = {
  field: string;
  Icon: Icon;
  tone: IconTileTone;
  role: string;
  title: string;
  description: string;
  count: number;
  summary: string;
  content: ReactNode;
};

const countIds = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string") return value.split(",").filter((id) => id.trim()).length;
  return 0;
};

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

/** Context tab: what the agent knows, uses, and remembers during a call, on one rail. */
export const VoiceContextSection = ({ hasField }: VoiceContextSectionProps) => {
  const [knowledgeBaseIds, skillIds, turnsRemembered] = useWatch({
    name: [
      `${VOICE_FIELDS.knowledgeBases}.knowledgeBase`,
      `${VOICE_FIELDS.skills}.skills`,
      `${VOICE_FIELDS.memory}.maxDataStored`,
    ],
  });

  const knowledgeBaseCount = countIds(knowledgeBaseIds);
  const skillCount = countIds(skillIds);
  const turns = Number(turnsRemembered) || 0;

  const stages: ContextStage[] = [
    {
      field: VOICE_FIELDS.knowledgeBases,
      Icon: BookOpenTextIcon,
      tone: "sky",
      role: "Knows",
      title: "Knowledge base",
      description: "Documents the agent searches before it answers.",
      count: knowledgeBaseCount,
      summary: plural(knowledgeBaseCount, "source", "sources"),
      content: <KnowledgeBaseConfigField name={VOICE_FIELDS.knowledgeBases} hideGroup />,
    },
    {
      field: VOICE_FIELDS.skills,
      Icon: PuzzlePieceIcon,
      tone: "teal",
      role: "Uses",
      title: "Skills",
      description: "Packaged know-how the agent loads when a call needs it.",
      count: skillCount,
      summary: plural(skillCount, "skill", "skills"),
      content: <SkillsConfigField name={VOICE_FIELDS.skills} hideGroup />,
    },
    {
      field: VOICE_FIELDS.memory,
      Icon: ClockCounterClockwiseIcon,
      tone: "magenta",
      role: "Remembers",
      title: "Short-term memory",
      description: "Earlier turns of the call the agent keeps in mind.",
      count: turns,
      summary: `${plural(turns, "turn", "turns")} of memory`,
      content: <MemoryConfigField name={VOICE_FIELDS.memory} hideGroup />,
    },
  ];

  const shownStages = stages.filter((stage) => hasField(stage.field));
  const summaries = shownStages.filter((stage) => stage.count > 0).map((stage) => stage.summary);

  return (
    <VoiceBuilderSection
      id="context"
      intro={
        <div className="space-y-1">
          <VoiceTabHeading label="Context" title="What the agent knows during a call" />
          <p className="text-hint text-muted-foreground">
            {summaries.length > 0
              ? `Grounded in ${summaries.join(", ")}.`
              : "All optional. Without context, the agent answers from its prompt alone."}
          </p>
        </div>
      }
    >
      <ol aria-label="Context sources" className="pt-1">
        {shownStages.map((stage, index) => (
          <VoiceStage
            key={stage.field}
            Icon={stage.Icon}
            tone={stage.tone}
            role={stage.role}
            title={stage.title}
            description={stage.description}
            hasNext={index < shownStages.length - 1}
            mark={stage.count > 0 ? "ready" : "idle"}
          >
            {stage.content}
          </VoiceStage>
        ))}
      </ol>
    </VoiceBuilderSection>
  );
};
