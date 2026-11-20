import { IconTile } from "@avplatform/ui/icon-tile";
import { OPTION_CARD, OPTION_CARD_FOCUS, OPTION_CARD_IDLE, cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import {
  BracketsCurlyIcon,
  IdentificationCardIcon,
  ListChecksIcon,
  PhoneIncomingIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { VoiceAgentPromptAction } from "@/features/dynamic-config-panel";

import { VOICE_AGENT_TEMPLATES, VOICE_FIELDS } from "../constants/voice-builder.constant";
import type { VoiceAgentTemplate } from "../types/voice-builder.type";
import {
  getInstructionVariables,
  getPersonaVariables,
  getPromptStageMarks,
  getUndefinedVariables,
  getUsedVariables,
  isPersonaEmpty,
} from "../utils/voice-builder.util";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceOpeningFields } from "./VoiceOpeningFields";
import { VoiceStage } from "./VoiceStage";
import { VoiceTabHeading } from "./VoiceTabHeading";
import { VoiceVariablesEditor } from "./VoiceVariablesEditor";

type VoicePromptSectionProps = {
  renderField: (name: string) => ReactNode;
  /** Renders a persona or instructions field without the Variables popover button. */
  renderPromptField: (name: string) => ReactNode;
};

/** Placeholders one stage's fields use, so each stage shows only the variables it writes. */
const StageVariables = ({ names, emptyHint }: { names: string[]; emptyHint: string }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    <span className="flex items-center gap-1 font-mono text-label uppercase text-muted-foreground">
      <BracketsCurlyIcon aria-hidden="true" className="size-3.5" />
      Variables
    </span>
    {names.length ? (
      names.map((name) => (
        <span
          key={name}
          className="rounded bg-sunken px-1.5 py-0.5 font-mono text-hint text-primary-text"
        >
          {`{{${name}}}`}
        </span>
      ))
    ) : (
      <span className="text-hint text-muted-foreground">{emptyHint}</span>
    )}
  </div>
);

/** Prompt fields a template overwrites, so Undo can restore exactly those. */
const TEMPLATE_FIELDS = [
  VOICE_FIELDS.goal,
  VOICE_FIELDS.role,
  VOICE_FIELDS.instructions,
  VOICE_FIELDS.firstSpeaker,
  VOICE_FIELDS.introduction,
] as const;

/** Prompt tab: persona, instructions, opening, and variables as stages on a rail. */
export const VoicePromptSection = ({ renderField, renderPromptField }: VoicePromptSectionProps) => {
  const { watch, setValue, getValues, resetField, formState } = useFormContext();
  const values = watch();
  const marks = getPromptStageMarks(values);

  const applyTemplate = (template: VoiceAgentTemplate) => {
    const wasDirty = formState.isDirty;
    const previous = getValues();
    const snapshot = {
      goal: previous[VOICE_FIELDS.goal],
      role: previous[VOICE_FIELDS.role],
      instructions: previous[VOICE_FIELDS.instructions],
      firstSpeaker: previous[VOICE_FIELDS.firstSpeaker],
      introduction: previous[VOICE_FIELDS.introduction],
    };
    const options = { shouldDirty: true };
    setValue(VOICE_FIELDS.goal, template.goal, options);
    setValue(VOICE_FIELDS.role, template.role, options);
    setValue(VOICE_FIELDS.instructions, template.instructions, options);
    setValue(VOICE_FIELDS.firstSpeaker, "ai", options);
    setValue(VOICE_FIELDS.introduction, template.introduction, options);
    toast.success(`Applied the ${template.name} template.`, {
      action: {
        label: "Undo",
        onClick: () => {
          // Restoring saved values on a clean form should leave it clean, not mark it edited.
          if (!wasDirty) {
            TEMPLATE_FIELDS.forEach((name) => resetField(name));
            return;
          }
          setValue(VOICE_FIELDS.goal, snapshot.goal, options);
          setValue(VOICE_FIELDS.role, snapshot.role, options);
          setValue(VOICE_FIELDS.instructions, snapshot.instructions, options);
          setValue(VOICE_FIELDS.firstSpeaker, snapshot.firstSpeaker, options);
          setValue(VOICE_FIELDS.introduction, snapshot.introduction, options);
        },
      },
    });
  };

  return (
    <VoiceBuilderSection
      id="prompt"
      action={<VoiceAgentPromptAction />}
      intro={
        <div>
          <VoiceTabHeading label="Prompt" title="Who the agent is and how it talks" />
          {isPersonaEmpty(values) && (
            <div
              role="group"
              aria-label="Start from a template"
              className="mt-2.5 grid gap-3 sm:grid-cols-3"
            >
              {VOICE_AGENT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={cn(
                    OPTION_CARD,
                    OPTION_CARD_IDLE,
                    OPTION_CARD_FOCUS,
                    "flex items-start gap-3 p-3 text-left",
                  )}
                >
                  <IconTile Icon={SparkleIcon} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-semibold text-ink">
                      {template.name}
                    </span>
                    <span className="block text-hint text-muted-foreground">
                      {template.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      <ol aria-label="Prompt stages" className="pt-1">
        <VoiceStage
          Icon={IdentificationCardIcon}
          tone="primary"
          role="Is"
          title="Persona"
          description="Who the agent is and what it must achieve."
          hasNext
          mark={marks.persona}
        >
          {renderPromptField(VOICE_FIELDS.role)}
          {renderPromptField(VOICE_FIELDS.goal)}
          <StageVariables
            names={getPersonaVariables(values)}
            emptyHint="No variables in the persona yet."
          />
        </VoiceStage>

        <VoiceStage
          Icon={ListChecksIcon}
          tone="teal"
          role="Follows"
          title="Instructions"
          description="Rules the agent keeps to in every reply."
          hasNext
          mark={marks.instructions}
        >
          {renderPromptField(VOICE_FIELDS.instructions)}
          <StageVariables
            names={getInstructionVariables(values)}
            emptyHint="No variables in the instructions yet."
          />
        </VoiceStage>

        <VoiceStage
          Icon={PhoneIncomingIcon}
          tone="magenta"
          role="Opens"
          title="Opening"
          description="How the call starts."
          hasNext
          mark={marks.opening}
        >
          <VoiceOpeningFields renderField={renderField} />
        </VoiceStage>

        <VoiceStage
          Icon={BracketsCurlyIcon}
          tone="sky"
          role="Fills"
          title="Dynamic variables"
          description="Values that fill {{name}} placeholders in every call."
          mark={marks.variables}
        >
          <VoiceVariablesEditor
            usedNames={getUsedVariables(values)}
            missingNames={getUndefinedVariables(values)}
          />
        </VoiceStage>
      </ol>
    </VoiceBuilderSection>
  );
};
