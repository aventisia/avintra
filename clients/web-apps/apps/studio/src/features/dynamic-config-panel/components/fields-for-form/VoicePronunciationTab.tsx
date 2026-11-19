import { Switch } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { InfoIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";

import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";

import { getCachedNodeConfig, getNodeConfig } from "../../apis/get-node-config";
import { useDynamicConfigPanelStore } from "../../stores/dcp-store";
import { DCPFieldSchemaType } from "../../types/dcp-field-schema-type";
import { isTtsPreviewSupported } from "../../utils/voice-preview.util";
import { ConfigFieldCard } from "./ConfigFieldCard";
import { VoicePronunciationField, toPronunciationRows } from "./VoicePronunciationField";

const VOICE_PRONUNCIATION_CATEGORY = "Pronunciation";
const PRONUNCIATION_TOGGLE_NAME = "__PronunciationEnabled__Voice";
const PRONUNCIATION_FIELD_NAME = "__Pronunciation__Voice";

type CachedNodeConfig = DCPFieldSchemaType[] | { fields?: DCPFieldSchemaType[] };

const normalizeFields = (config: CachedNodeConfig | undefined): DCPFieldSchemaType[] =>
  Array.isArray(config) ? config : (config?.fields ?? []);

/** Renders the Voice Agent Pronunciation tab as a switchable lexicon card. */
export const VoicePronunciationTab = () => {
  const nodeName = useDynamicConfigPanelStore((state) => state.nodeData?.name);
  const [fallbackFields, setFallbackFields] = useState<DCPFieldSchemaType[] | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);

  const cachedFields = useMemo(
    () => normalizeFields(getCachedNodeConfig(nodeName ?? "") as CachedNodeConfig | undefined),
    [nodeName],
  );

  useEffect(() => {
    setHasLoadError(false);
    if (!nodeName || cachedFields.length > 0) return;

    let active = true;
    getNodeConfig(nodeName)
      .then((config) => {
        if (active) setFallbackFields(normalizeFields(config as unknown as CachedNodeConfig));
      })
      .catch(() => {
        if (!active) return;
        setFallbackFields([]);
        setHasLoadError(true);
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

  const { control, formState } = useFormContext();
  const [pronunciationEnabled, pronunciationValue, engineMode, ttsProvider] = useWatch({
    control,
    name: [
      PRONUNCIATION_TOGGLE_NAME,
      PRONUNCIATION_FIELD_NAME,
      "__EngineMode__Voice",
      "__ModelConfig__TextToSpeech.provider",
    ],
  });

  if (!nodeName || nodeName !== VOICE_AGENT_NODE_NAME) {
    return null;
  }

  if (pronunciationFields.length === 0 && hasLoadError) {
    return (
      <p role="alert" className="text-hint text-bad">
        Pronunciation settings could not be loaded.
      </p>
    );
  }

  if (pronunciationFields.length === 0) {
    return null;
  }

  const isEnabled = pronunciationEnabled === true;
  const termCount = toPronunciationRows(pronunciationValue).rows.length;
  const hasError = Boolean(
    formState.errors[PRONUNCIATION_FIELD_NAME] || formState.errors[PRONUNCIATION_TOGGLE_NAME],
  );
  const pronunciationToggle = fieldByName.get(PRONUNCIATION_TOGGLE_NAME);
  const providerNote =
    engineMode === "realtime"
      ? "Realtime agents apply these terms through their spoken instructions."
      : ttsProvider && !isTtsPreviewSupported(ttsProvider as string)
        ? "This voice can't be previewed, but the terms still apply wherever it speaks."
        : null;

  // IMPORTANT NOTE: the field stays mounted while the switch is off so its saved value still reaches
  // the flushed inputKeys; hidden is CSS-only.
  return (
    <ConfigFieldCard
      Icon={SpeakerHighIcon}
      tone="magenta"
      label="Says"
      title="Pronunciation"
      description={
        pronunciationToggle?.description ||
        "Names, acronyms and jargon, spoken the way you want them."
      }
      aside={
        <span className="flex shrink-0 items-center gap-2.5">
          <PronunciationStatus isEnabled={isEnabled} termCount={termCount} hasError={hasError} />
          <PronunciationToggle />
        </span>
      }
    >
      <div className={cn("space-y-2", !isEnabled && "hidden")}>
        <VoicePronunciationField name={PRONUNCIATION_FIELD_NAME} disabled={!isEnabled} size="sm" />
        {providerNote && (
          <p className="flex items-center gap-1.5 text-hint text-muted-foreground">
            <InfoIcon aria-hidden="true" className="size-3.5 shrink-0" />
            {providerNote}
          </p>
        )}
      </div>
    </ConfigFieldCard>
  );
};

const PronunciationToggle = () => {
  const { field } = useController({ name: PRONUNCIATION_TOGGLE_NAME });
  return (
    <Switch
      size="sm"
      checked={field.value === true}
      onCheckedChange={field.onChange}
      aria-label="Use custom pronunciations"
    />
  );
};

const PronunciationStatus = ({
  isEnabled,
  termCount,
  hasError,
}: {
  isEnabled: boolean;
  termCount: number;
  hasError: boolean;
}) => {
  const [text, toneClass] = hasError
    ? ["Needs attention", "border-bad/40 text-bad"]
    : !isEnabled
      ? ["Off", "border-line text-muted-foreground"]
      : termCount === 0
        ? ["No terms", "border-warn/40 text-warn"]
        : [
            `${termCount} ${termCount === 1 ? "term" : "terms"}`,
            "border-[color-mix(in_srgb,var(--primary-base)_30%,transparent)] text-primary-text",
          ];

  return (
    <span
      className={cn(
        "flex h-6 items-center rounded-sm border px-2 font-mono text-label uppercase",
        toneClass,
      )}
    >
      {text}
    </span>
  );
};
