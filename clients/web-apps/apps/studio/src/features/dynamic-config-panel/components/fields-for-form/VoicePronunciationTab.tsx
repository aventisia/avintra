import { Badge } from "@avplatform/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";

import { getCachedNodeConfig, getNodeConfig } from "../../apis/get-node-config";
import { useDynamicConfigPanelStore } from "../../stores/dcp-store";
import { DCPFieldSchemaType } from "../../types/dcp-field-schema-type";
import { isTtsPreviewSupported } from "../../utils/voice-preview.util";
import { VoiceFeatureCard } from "./VoiceFeatureCard";
import { VoicePronunciationField } from "./VoicePronunciationField";

const VOICE_PRONUNCIATION_CATEGORY = "Pronunciation";
const PRONUNCIATION_TOGGLE_NAME = "__PronunciationEnabled__Voice";
const PRONUNCIATION_FIELD_NAME = "__Pronunciation__Voice";

const hasArrayEntries = (value: unknown): boolean => Array.isArray(value) && value.length > 0;

type CachedNodeConfig = DCPFieldSchemaType[] | { fields?: DCPFieldSchemaType[] };

const normalizeFields = (config: CachedNodeConfig | undefined): DCPFieldSchemaType[] =>
  Array.isArray(config) ? config : (config?.fields ?? []);

const statusBadge = (enabled: boolean, configured: boolean) => {
  if (!enabled) return <Badge variant="outline">Off</Badge>;

  return configured ? (
    <Badge variant="secondary">Configured</Badge>
  ) : (
    <Badge variant="outline">Not configured</Badge>
  );
};

/** Renders the Voice Agent Pronunciation tab as a persisted feature card. */
export const VoicePronunciationTab = () => {
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
  const pronunciationFields = useMemo(
    () => allFields.filter((field) => field.category === VOICE_PRONUNCIATION_CATEGORY),
    [allFields],
  );
  const fieldByName = useMemo(
    () => new Map(pronunciationFields.map((field) => [field.name, field])),
    [pronunciationFields],
  );

  const { watch } = useFormContext();

  if (!nodeName || nodeName !== VOICE_AGENT_NODE_NAME || pronunciationFields.length === 0) {
    return null;
  }

  const pronunciationEnabled = watch(PRONUNCIATION_TOGGLE_NAME) === true;
  const pronunciationValue = watch(PRONUNCIATION_FIELD_NAME);
  const ttsProvider = watch("__ModelConfig__TextToSpeech.provider");

  const pronunciationToggle = fieldByName.get(PRONUNCIATION_TOGGLE_NAME);

  return (
    <div className="space-y-3">
      <VoiceFeatureCard
        title="Pronunciation"
        description="Speak names, terms, and acronyms the way you want during speech synthesis."
        toggleName={PRONUNCIATION_TOGGLE_NAME}
        toggleLabel={pronunciationToggle?.label}
        toggleDescription={pronunciationToggle?.description}
        fieldNames={[PRONUNCIATION_FIELD_NAME, PRONUNCIATION_TOGGLE_NAME]}
        badge={statusBadge(pronunciationEnabled, hasArrayEntries(pronunciationValue))}
      >
        <VoicePronunciationField
          name={PRONUNCIATION_FIELD_NAME}
          disabled={!pronunciationEnabled}
          label={fieldByName.get(PRONUNCIATION_FIELD_NAME)?.label}
          description={fieldByName.get(PRONUNCIATION_FIELD_NAME)?.description}
          size="sm"
        />
        {ttsProvider && !isTtsPreviewSupported(ttsProvider as string) ? (
          <p className="text-2xs text-muted-foreground">
            Voice preview is not supported for this provider. Pronunciation aliases still apply
            where speech synthesis is supported.
          </p>
        ) : null}
      </VoiceFeatureCard>
    </div>
  );
};
