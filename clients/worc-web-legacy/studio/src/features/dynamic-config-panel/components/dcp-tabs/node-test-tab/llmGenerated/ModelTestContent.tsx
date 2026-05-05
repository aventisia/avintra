import { JsonViewer } from "@/components/json-viewer/JsonViewer";
import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { LLMResponseDto } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { STTResponseDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { TTSResponseDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { useExecuteModelMutation } from "@/features/dynamic-config-panel/hooks/useExecuteModelMutation";
import { useExecuteSTTMutation } from "@/features/dynamic-config-panel/hooks/useExecuteSTTMutation";
import { useExecuteTTSMutation } from "@/features/dynamic-config-panel/hooks/useExecuteTTSMutation";

import { Textarea } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

import AIAudioPlayer from "./AIAudioPlayer";
import ExecuteButton from "./ExecuteButton";
import FileUploadStep from "./FileUploadStep";
import STTInputStep, { STTInputValue } from "./STTInputStep";

// ─── Provider type detection ─────────────────────────────────────────────────
//
// We detect which node type is being tested from the formData keys, matching
// the naming convention used in ModelConfigField:
//   __ModelConfig__Inferencing  → "llm"
//   __ModelConfig__SpeechToText → "stt"
//   __ModelConfig__TextToSpeech → "tts"

type ProviderType = "llm" | "stt" | "tts";

function detectProviderType(formData: Record<string, unknown>): ProviderType {
  const keys = Object.keys(formData);
  if (keys.some((k) => k.includes("__ModelConfig__SpeechToText"))) return "stt";
  if (keys.some((k) => k.includes("__ModelConfig__TextToSpeech"))) return "tts";
  return "llm";
}

// ─── STT transcript result panel ─────────────────────────────────────────────

function STTResultPanel({ data }: { data: STTResponseDto }) {
  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Error banner — shown when BE returns a failed status */}
      {data.error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {data.error}
        </div>
      )}
      {/* Transcript output — read-only textarea */}
      <Textarea
        rows={20}
        value={data.output ?? ""}
        disabled
        placeholder="Transcript will appear here…"
      />
    </div>
  );
}

// ─── Step types ───────────────────────────────────────────────────────────────

type Step = "input" | "execute";

interface StepState {
  llmFiles?: File[]; // Files selected in FileUploadStep (LLM inferencing)
  sttInput?: STTInputValue; // Input collected by STTInputStep
}

// ─── Main component ───────────────────────────────────────────────────────────

const ModelTestContent = ({
  formData,
}: {
  formData: { [x: string]: unknown };
}) => {
  const llmMutation = useExecuteModelMutation();
  const sttMutation = useExecuteSTTMutation();
  const ttsMutation = useExecuteTTSMutation();

  // Derived once per render — safe because formData keys are stable during a test session
  const providerType = detectProviderType(formData);

  const [step, setStep] = useState<Step>("input");
  const [stepState, setStepState] = useState<StepState>({});

  // Select the correct mutation hook based on detected node type
  const activeMutation =
    providerType === "stt"
      ? sttMutation
      : providerType === "tts"
        ? ttsMutation
        : llmMutation;

  const { mutate, isPending, data } = activeMutation;

  // TTS has no file-upload step — jump straight to the execute screen
  useEffect(() => {
    if (providerType === "tts") setStep("execute");
  }, [providerType]);

  // ── Step handlers ────────────────────────────────────────────────────────

  const handleLLMFilesNext = (files: File[]) => {
    setStepState({ llmFiles: files });
    setStep("execute");
  };

  const handleSTTInputNext = (input: STTInputValue) => {
    setStepState({ sttInput: input });
    setStep("execute");
  };

  // ── Output renderer ──────────────────────────────────────────────────────

  const renderOutput = () => {
    if (isPending) return <JsonViewerSkeleton />;

    // ── TTS: audio player ──
    if (providerType === "tts") {
      const ttsData = data as unknown as TTSResponseDto | undefined;
      if (!ttsData?.output) {
        return (
          <Textarea
            rows={5}
            disabled
            placeholder="Execute to generate audio output…"
          />
        );
      }
      return (
        <div className="p-3">
          {/*
           * Pass the format from the response when available so the player
           * constructs the correct data URL scheme (e.g. audio/wav vs audio/mpeg).
           */}
          <AIAudioPlayer
            base64Data={ttsData.output}
            format="audio/mpeg" // ElevenLabs default; swap for ttsData.format if BE adds it
          />
        </div>
      );
    }

    // ── STT: transcript panel ──
    if (providerType === "stt") {
      const sttData = data as unknown as STTResponseDto | undefined;
      if (!sttData) {
        return (
          <Textarea
            rows={5}
            disabled
            placeholder="Execute to generate transcript…"
          />
        );
      }
      return <STTResultPanel data={sttData} />;
    }

    // ── LLM: JSON viewer or plain textarea ──
    const llmData = data as unknown as LLMResponseDto | undefined;
    if (llmData?.is_json_output) {
      return (
        <JsonViewer
          jsonData={JSON.stringify(llmData?.output ?? {})}
          className="h-[calc(64vh)]"
          enableCopy
        />
      );
    }
    return (
      <Textarea
        rows={25}
        value={llmData?.output ?? JSON.stringify(formData, null, 2)}
        disabled
      />
    );
  };

  // ── Step 1: input collection (not shown for TTS) ──────────────────────────

  if (step === "input") {
    return (
      <DCPTabsContent tabValue="Test">
        {providerType === "stt" ? (
          // STT requires audio input before execution
          <STTInputStep onNext={handleSTTInputNext} />
        ) : (
          // LLM file upload is optional — user can skip directly to Execute
          <FileUploadStep onNext={handleLLMFilesNext} />
        )}
      </DCPTabsContent>
    );
  }

  // ── Step 2: execute + results ─────────────────────────────────────────────

  return (
    <DCPTabsContent
      tabValue="Test"
      footer={
        <ExecuteButton
          isPending={isPending}
          mutate={mutate}
          formData={formData}
          providerType={providerType}
          llmFiles={stepState.llmFiles}
          sttInput={stepState.sttInput}
        />
      }
    >
      {/* Back button — not shown for TTS since it has no input step */}
      {providerType !== "tts" && (
        <div className="px-3 pt-2">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="gap-1 text-xs text-muted-foreground"
            onClick={() => setStep("input")}
            disabled={isPending}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {providerType === "stt" ? "Change input" : "Change files"}
          </Button>
        </div>
      )}

      <div className="border-dividers m-3 overflow-hidden rounded-lg border border-solid">
        {renderOutput()}
      </div>
    </DCPTabsContent>
  );
};

export default ModelTestContent;
