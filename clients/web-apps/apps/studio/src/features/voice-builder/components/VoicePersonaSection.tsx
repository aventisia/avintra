import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";
import { AlertTriangle, Braces, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { VoiceAgentPromptAction } from "@/features/dynamic-config-panel/components/fields-for-form/prompt-field/VoiceAgentPromptAction";

import { VOICE_AGENT_TEMPLATES, VOICE_FIELDS } from "../constants/voice-builder.constant";
import type { VoiceAgentTemplate } from "../types/voice-builder.type";
import {
  getDefinedVariables,
  getUndefinedVariables,
  isPersonaEmpty,
} from "../utils/voice-builder.util";
import { VoiceBuilderSection } from "./VoiceBuilderSection";

type VoicePersonaSectionProps = {
  renderField: (name: string) => ReactNode;
};

export const VoicePersonaSection = ({ renderField }: VoicePersonaSectionProps) => {
  const { watch, setValue, getValues } = useFormContext();
  const values = watch();
  const definedVariables = getDefinedVariables(values);
  const undefinedVariables = getUndefinedVariables(values);

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
      id="persona"
      title="Persona"
      description="Who the agent is, what it must achieve, and the rules it follows."
      action={<VoiceAgentPromptAction />}
    >
      {isPersonaEmpty(values) && (
        <div className="rounded-lg bg-sunken p-3">
          <p className="mb-2 flex items-center gap-1.5 text-body-sm font-semibold text-ink">
            <Sparkles aria-hidden="true" className="size-3.5 text-primary-text" />
            Start from a template
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {VOICE_AGENT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-left hover:border-line-strong hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
              >
                <span className="block text-body-sm font-semibold text-ink">{template.name}</span>
                <span className="block text-hint text-muted-foreground">
                  {template.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {renderField(VOICE_FIELDS.role)}
      {renderField(VOICE_FIELDS.goal)}
      {renderField(VOICE_FIELDS.instructions)}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 text-label uppercase text-muted-foreground">
          <Braces aria-hidden="true" className="size-3.5" />
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
            Define variables under Pronunciation & variables to insert them here.
          </span>
        )}
      </div>

      {undefinedVariables.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-body-sm text-ink">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-warn" />
          Not defined yet:
          {undefinedVariables.map((name) => (
            <Badge key={name} variant="outline" className="font-mono">
              {name}
            </Badge>
          ))}
          <span className="text-hint text-muted-foreground">
            Define them so the agent can fill them in during a call.
          </span>
        </div>
      )}
    </VoiceBuilderSection>
  );
};
