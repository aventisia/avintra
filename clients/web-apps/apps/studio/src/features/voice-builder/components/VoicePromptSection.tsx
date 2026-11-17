import { Switch } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import {
  BracketsCurlyIcon,
  IdentificationCardIcon,
  ListChecksIcon,
  PhoneIncomingIcon,
  SparkleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";

import { VoiceAgentPromptAction } from "@/features/dynamic-config-panel";

import { VOICE_AGENT_TEMPLATES, VOICE_FIELDS } from "../constants/voice-builder.constant";
import type { VoiceAgentTemplate } from "../types/voice-builder.type";
import {
  getDefinedVariables,
  getPromptStageMarks,
  getUndefinedVariables,
  isPersonaEmpty,
} from "../utils/voice-builder.util";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { VoiceOpeningFields } from "./VoiceOpeningFields";
import { VoiceStage } from "./VoiceStage";
import { VoiceTabHeading } from "./VoiceTabHeading";

type VoicePromptSectionProps = {
  renderField: (name: string) => ReactNode;
  /** Renders the persona instructions in the prompt editor, without a label of its own. */
  renderPromptEditor: (name: string) => ReactNode;
  /** The dynamic variables table, which fills `{{name}}` placeholders in this tab. */
  variablesField: ReactNode;
};

/** Prompt tab: persona, instructions, opening, and variables as stages on a rail. */
export const VoicePromptSection = ({
  renderField,
  renderPromptEditor,
  variablesField,
}: VoicePromptSectionProps) => {
  const { watch, setValue, getValues } = useFormContext();
  const { field: variablesToggle } = useController({ name: VOICE_FIELDS.variablesEnabled });
  const values = watch();
  const marks = getPromptStageMarks(values);
  const definedVariables = getDefinedVariables(values);
  const undefinedVariables = getUndefinedVariables(values);
  const variablesOn = variablesToggle.value === true;

  const applyTemplate = (template: VoiceAgentTemplate) => {
    const options = { shouldDirty: true };
    setValue(VOICE_FIELDS.goal, template.goal, options);
    setValue(VOICE_FIELDS.role, template.role, options);
    setValue(VOICE_FIELDS.instructions, template.instructions, options);
    setValue(VOICE_FIELDS.firstSpeaker, "ai", options);
    setValue(VOICE_FIELDS.introduction, template.introduction, options);
    toast.success(`Applied the ${template.name} template. Review it, then save.`);
  };

  const insertVariable = (name: string) => {
    const instructions = (getValues(VOICE_FIELDS.instructions) as string | undefined) ?? "";
    setValue(VOICE_FIELDS.instructions, `${instructions.trimEnd()} {{${name}}}`.trimStart(), {
      shouldDirty: true,
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
                  className="flex items-start gap-3 rounded-md border border-line-strong/40 bg-surface p-3 text-left transition-colors duration-150 hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
          role="Is"
          title="Persona"
          description="Who the agent is and what it must achieve."
          hasNext
          mark={marks.persona}
        >
          {renderField(VOICE_FIELDS.role)}
          {renderField(VOICE_FIELDS.goal)}
        </VoiceStage>

        <VoiceStage
          Icon={ListChecksIcon}
          role="Follows"
          title="Instructions"
          description="Rules the agent keeps to in every reply."
          hasNext
          mark={marks.instructions}
        >
          {renderPromptEditor(VOICE_FIELDS.instructions)}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 font-mono text-label uppercase text-muted-foreground">
              <BracketsCurlyIcon aria-hidden="true" className="size-3.5" />
              Variables
            </span>
            {definedVariables.length ? (
              definedVariables.map((name) => (
                <Button
                  key={name}
                  type="button"
                  variant="outline"
                  size="xs"
                  className="font-mono"
                  onClick={() => insertVariable(name)}
                >
                  {`{{${name}}}`}
                </Button>
              ))
            ) : (
              <span className="text-hint text-muted-foreground">
                {variablesOn
                  ? "Add a variable below to insert it here."
                  : "Turn on dynamic variables below to insert them here."}
              </span>
            )}
          </div>
        </VoiceStage>

        <VoiceStage
          Icon={PhoneIncomingIcon}
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
          role="Fills"
          title="Dynamic variables"
          description="Fill {{name}} placeholders for each call."
          mark={marks.variables}
          aside={
            <Switch
              size="sm"
              checked={variablesOn}
              onCheckedChange={variablesToggle.onChange}
              aria-label="Use dynamic variables"
            />
          }
        >
          {undefinedVariables.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-body-sm text-ink">
              <WarningIcon aria-hidden="true" className="size-4 shrink-0 text-warn" />
              {variablesOn ? "Not defined yet:" : "Not filled while variables are off:"}
              {undefinedVariables.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
              <span className="text-hint text-muted-foreground">
                {variablesOn
                  ? "Define them so the agent can fill them in during a call."
                  : "Turn on dynamic variables to fill them during a call."}
              </span>
            </div>
          )}
          {/* IMPORTANT NOTE: the table stays mounted while variables are off so switching them off never
          unmounts the field and drops its saved value from the flushed inputKeys; hidden is CSS-only. */}
          <div className={cn(!variablesOn && "hidden")}>{variablesField}</div>
        </VoiceStage>
      </ol>
    </VoiceBuilderSection>
  );
};
