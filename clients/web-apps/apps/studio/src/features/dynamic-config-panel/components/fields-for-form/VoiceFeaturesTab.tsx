import { Badge } from "@avplatform/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";

import { getCachedNodeConfig, getNodeConfig } from "../../apis/get-node-config";
import { useDynamicConfigPanelStore } from "../../stores/dcp-store";
import { DCPFieldSchemaType } from "../../types/dcp-field-schema-type";
import { isTtsPreviewSupported } from "../../utils/voice-preview.util";
import { RenderField } from "../RenderField";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";
import { VoiceFeatureCard } from "./VoiceFeatureCard";
import { VoicePronunciationField } from "./VoicePronunciationField";
import { VoiceVariablesField } from "./VoiceVariablesField";
import { VoiceWebhookField } from "./VoiceWebhookField";

const VOICE_FEATURES_CATEGORY = "Features";

const TOGGLE_NAMES = {
  variables: "__VariablesEnabled__Voice",
  pronunciation: "__PronunciationEnabled__Voice",
  escalation: "__EscalationEnabled__Voice",
  transcriptWebhook: "__TranscriptWebhookEnabled__Voice",
  sfx: "__SfxEnabled__Voice",
  sfxToolCallCue: "__SfxToolCallCueEnabled__Voice",
  sfxAmbience: "__SfxAmbienceEnabled__Voice",
} as const;

const CONFIG_FIELD_NAMES = {
  variables: ["__Variables__Voice"],
  pronunciation: ["__Pronunciation__Voice"],
  escalation: [
    "__EscalationDestination__Voice",
    "__EscalationCondition__Voice",
    "__EscalationFallback__Voice",
  ],
  transcriptWebhook: ["__TranscriptWebhookUrl__Voice", "__TranscriptWebhookSecret__Voice"],
  sfx: ["__SfxToolCallCueUrl__Voice", "__SfxAmbienceUrl__Voice"],
  comingSoon: ["__VirtualAvatar__Voice", "__ScreenShare__Voice", "__CameraFeed__Voice"],
} as const;

type CachedNodeConfig = DCPFieldSchemaType[] | { fields?: DCPFieldSchemaType[] };

const isNonBlankString = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length > 0;

const isHttpsUrl = (value: unknown): boolean => {
  if (typeof value !== "string" || value.trim().length === 0) return false;

  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
};

const hasObjectEntries = (value: unknown): boolean =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0;

const hasArrayEntries = (value: unknown): boolean => Array.isArray(value) && value.length > 0;

const normalizeFields = (config: CachedNodeConfig | undefined): DCPFieldSchemaType[] =>
  Array.isArray(config) ? config : (config?.fields ?? []);

/** Renders the Voice Agent Features tab as persisted feature cards. */
export const VoiceFeaturesTab = () => {
  const nodeName = useDynamicConfigPanelStore((state) => state.nodeData?.name);
  const [fallbackFields, setFallbackFields] = useState<DCPFieldSchemaType[] | null>(null);

  const cachedFields = useMemo(
    () => normalizeFields(getCachedNodeConfig(nodeName ?? "") as CachedNodeConfig | undefined),
    [nodeName],
  );

  useEffect(() => {
    if (!nodeName || cachedFields.length > 0) return;

    let active = true;
    getNodeConfig(nodeName)
      .then((config) => {
        if (active) setFallbackFields(normalizeFields(config as unknown as CachedNodeConfig));
      })
      .catch(() => {
        if (active) setFallbackFields([]);
      });

    return () => {
      active = false;
    };
  }, [nodeName, cachedFields.length]);

  const allFields = useMemo(
    () => (cachedFields.length > 0 ? cachedFields : (fallbackFields ?? [])),
    [cachedFields, fallbackFields],
  );
  const featuresFields = useMemo(
    () => allFields.filter((field) => field.category === VOICE_FEATURES_CATEGORY),
    [allFields],
  );
  const fieldByName = useMemo(
    () => new Map(featuresFields.map((field) => [field.name, field])),
    [featuresFields],
  );

  const { watch } = useFormContext();

  if (!nodeName || nodeName !== VOICE_AGENT_NODE_NAME || featuresFields.length === 0) return null;

  const variablesEnabled = watch(TOGGLE_NAMES.variables) === true;
  const pronunciationEnabled = watch(TOGGLE_NAMES.pronunciation) === true;
  const escalationEnabled = watch(TOGGLE_NAMES.escalation) === true;
  const webhookEnabled = watch(TOGGLE_NAMES.transcriptWebhook) === true;
  const sfxEnabled = watch(TOGGLE_NAMES.sfx) === true;

  const variablesValue = watch("__Variables__Voice");
  const pronunciationValue = watch("__Pronunciation__Voice");
  const escalationDestination = watch("__EscalationDestination__Voice");
  const escalationCondition = watch("__EscalationCondition__Voice");
  const webhookUrl = watch("__TranscriptWebhookUrl__Voice");
  const cueUrl = watch("__SfxToolCallCueUrl__Voice");
  const ambienceUrl = watch("__SfxAmbienceUrl__Voice");
  const cueToggle = watch(TOGGLE_NAMES.sfxToolCallCue);
  const ambienceToggle = watch(TOGGLE_NAMES.sfxAmbience);
  const ttsProvider = watch("__ModelConfig__TextToSpeech.provider");

  const variablesToggle = fieldByName.get(TOGGLE_NAMES.variables);
  const pronunciationToggle = fieldByName.get(TOGGLE_NAMES.pronunciation);
  const escalationToggle = fieldByName.get(TOGGLE_NAMES.escalation);
  const webhookToggle = fieldByName.get(TOGGLE_NAMES.transcriptWebhook);
  const sfxToggle = fieldByName.get(TOGGLE_NAMES.sfx);

  const renderConfigField = (name: string, disabled = false) => {
    const field = fieldByName.get(name);
    if (!field) return null;

    return <RenderField key={field.name} {...field} disabled={field.disabled || disabled} force />;
  };

  const statusBadge = (enabled: boolean, configured: boolean) => {
    if (!enabled) return <Badge variant="outline">Off</Badge>;

    return configured ? (
      <Badge variant="secondary">Configured</Badge>
    ) : (
      <Badge variant="outline">Not configured</Badge>
    );
  };

  return (
    <div className="space-y-3">
      <VoiceFeatureCard
        title="Dynamic Variables"
        description="Fill {{name}} placeholders during pipeline conversations. Realtime sessions do not resolve them."
        toggleName={TOGGLE_NAMES.variables}
        toggleLabel={variablesToggle?.label}
        toggleDescription={variablesToggle?.description}
        fieldNames={[...CONFIG_FIELD_NAMES.variables, TOGGLE_NAMES.variables]}
        badge={statusBadge(variablesEnabled, hasObjectEntries(variablesValue))}
      >
        <VoiceVariablesField
          name="__Variables__Voice"
          disabled={!variablesEnabled}
          label={fieldByName.get("__Variables__Voice")?.label}
          description={fieldByName.get("__Variables__Voice")?.description}
          size="sm"
        />
      </VoiceFeatureCard>

      <VoiceFeatureCard
        title="Pronunciation"
        description="Speak names, terms, and acronyms the way you want during speech synthesis."
        toggleName={TOGGLE_NAMES.pronunciation}
        toggleLabel={pronunciationToggle?.label}
        toggleDescription={pronunciationToggle?.description}
        fieldNames={[...CONFIG_FIELD_NAMES.pronunciation, TOGGLE_NAMES.pronunciation]}
        badge={statusBadge(pronunciationEnabled, hasArrayEntries(pronunciationValue))}
      >
        <VoicePronunciationField
          name="__Pronunciation__Voice"
          disabled={!pronunciationEnabled}
          label={fieldByName.get("__Pronunciation__Voice")?.label}
          description={fieldByName.get("__Pronunciation__Voice")?.description}
          size="sm"
        />
        {ttsProvider && !isTtsPreviewSupported(ttsProvider as string) ? (
          <p className="text-2xs text-muted-foreground">
            Voice preview is not supported for this provider. Pronunciation aliases still apply
            where speech synthesis is supported.
          </p>
        ) : null}
      </VoiceFeatureCard>

      <VoiceFeatureCard
        title="Escalation"
        description="Store who a caller should reach and when."
        toggleName={TOGGLE_NAMES.escalation}
        toggleLabel={escalationToggle?.label}
        toggleDescription={escalationToggle?.description}
        fieldNames={[...CONFIG_FIELD_NAMES.escalation, TOGGLE_NAMES.escalation]}
        badge={statusBadge(
          escalationEnabled,
          isNonBlankString(escalationDestination) || isNonBlankString(escalationCondition),
        )}
      >
        {renderConfigField("__EscalationDestination__Voice", !escalationEnabled)}
        {renderConfigField("__EscalationCondition__Voice", !escalationEnabled)}
        {renderConfigField("__EscalationFallback__Voice", !escalationEnabled)}
        <p className="text-2xs text-muted-foreground">
          Phone transfer is not available. Values are stored for a later runtime change.
        </p>
      </VoiceFeatureCard>

      <VoiceFeatureCard
        title="Transcript Webhook"
        description="Send the transcript once a deployed voice conversation is archived."
        toggleName={TOGGLE_NAMES.transcriptWebhook}
        toggleLabel={webhookToggle?.label}
        toggleDescription={webhookToggle?.description}
        fieldNames={[...CONFIG_FIELD_NAMES.transcriptWebhook, TOGGLE_NAMES.transcriptWebhook]}
        badge={statusBadge(webhookEnabled, isHttpsUrl(webhookUrl))}
      >
        <VoiceWebhookField
          disabled={!webhookEnabled}
          size="sm"
          urlLabel={fieldByName.get("__TranscriptWebhookUrl__Voice")?.label}
          urlDescription={fieldByName.get("__TranscriptWebhookUrl__Voice")?.description}
          secretLabel={fieldByName.get("__TranscriptWebhookSecret__Voice")?.label}
          secretDescription={fieldByName.get("__TranscriptWebhookSecret__Voice")?.description}
        />
        <p className="text-2xs text-muted-foreground">
          Delivery runs once after archive; failures are logged and never interrupt the
          conversation. The secret is stored with the flow for a later runtime change; requests are
          not signed yet.
        </p>
      </VoiceFeatureCard>

      <VoiceFeatureCard
        title="Sound Effects"
        description="Play browser sounds for tool calls and voice sessions."
        toggleName={TOGGLE_NAMES.sfx}
        toggleLabel={sfxToggle?.label}
        toggleDescription={sfxToggle?.description}
        fieldNames={[
          ...CONFIG_FIELD_NAMES.sfx,
          TOGGLE_NAMES.sfx,
          TOGGLE_NAMES.sfxToolCallCue,
          TOGGLE_NAMES.sfxAmbience,
        ]}
        badge={statusBadge(sfxEnabled, isNonBlankString(cueUrl) || isNonBlankString(ambienceUrl))}
      >
        <GroupedFieldsWrapper groupName="Tool-call cue">
          {renderConfigField(TOGGLE_NAMES.sfxToolCallCue)}
          {renderConfigField("__SfxToolCallCueUrl__Voice", cueToggle === false)}
        </GroupedFieldsWrapper>
        <GroupedFieldsWrapper groupName="Ambience">
          {renderConfigField(TOGGLE_NAMES.sfxAmbience)}
          {renderConfigField("__SfxAmbienceUrl__Voice", ambienceToggle === false)}
        </GroupedFieldsWrapper>
        <p className="text-2xs text-muted-foreground">
          Thinking sound, volume, and chance controls are not available yet. Sounds play in the
          browser only.
        </p>
      </VoiceFeatureCard>

      <VoiceFeatureCard
        title="Coming soon"
        description="These capabilities are not available yet."
        badge={<Badge variant="outline">Coming soon</Badge>}
        fieldNames={[...CONFIG_FIELD_NAMES.comingSoon]}
      >
        {CONFIG_FIELD_NAMES.comingSoon.map((name) => renderConfigField(name))}
      </VoiceFeatureCard>
    </div>
  );
};
