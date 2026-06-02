import CustomCheckbox from "@/components/CustomCheckbox";
import { JsonViewer } from "@/components/json-viewer/JsonViewer";
import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { LLMResponseDto } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { STTResponseDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { TTSResponseDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { useExecuteModelMutation } from "@/features/dynamic-config-panel/hooks/useExecuteModelMutation";
import { useExecuteSTTMutation } from "@/features/dynamic-config-panel/hooks/useExecuteSTTMutation";
import { useExecuteTTSMutation } from "@/features/dynamic-config-panel/hooks/useExecuteTTSMutation";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

import { Textarea } from "@aventisia/ui";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import AudioPlayer from "./AudioPlayer";
import ExecuteButton from "./ExecuteButton";
import FileUploadStep from "./FileUploadStep";
import STTInputStep, { STTInputValue } from "./STTInputStep";

//  Provider type detection
//
// Detected from formData key naming convention (set by ModelConfigField):
//   __ModelConfig__Inferencing ,__ModelConfig__Conversation → "llm"
//   __ModelConfig__SpeechToText → "stt"
//   __ModelConfig__TextToSpeech → "tts"

type ProviderType = "llm" | "stt" | "tts";

function detectProviderType(formData: Record<string, unknown>): ProviderType {
  const keys = Object.keys(formData);
  if (keys.some((k) => k.includes("__ModelConfig__SpeechToText"))) return "stt";
  if (keys.some((k) => k.includes("__ModelConfig__TextToSpeech"))) return "tts";
  return "llm";
}

//  STT transcript result panel

function STTResultPanel({ data }: { data: STTResponseDto }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Error banner — shown when BE returns a failed status */}
      {data.error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {data.error}
        </div>
      )}
      {/* Transcript output — read-only textarea */}
      <Textarea
        rows={10}
        value={data.output ?? ""}
        disabled
        placeholder="Transcript will appear here…"
        className="resize-none"
      />
    </div>
  );
}

//  Section label helper

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-medium ">{children}</p>;
}

//  Main component

const ModelTestContent = ({
  formData,
}: {
  formData: { [x: string]: unknown };
}) => {
  const { selectedTab } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      selectedTab: state.selectedTab,
    })),
  );

  const llmMutation = useExecuteModelMutation();
  const sttMutation = useExecuteSTTMutation();
  const ttsMutation = useExecuteTTSMutation();
  // Derived once per render — formData keys are stable for a given node type
  const providerType = detectProviderType(formData);
  const [useCurrentFileOnly, setUseCurrentFileOnly] = useState(true);

  // LLM: Local Store Integration
  const { files: storedLlmFiles, activeFileId } = useLocalFileStore(
    useShallow((state) => ({
      activeFileId: state.activeFileId,
      files: state.files,
    })),
  );

  const activeFile = storedLlmFiles.find(
    (file) => file.id === activeFileId,
  )?.originalFile;

  const llmFilesToExecute: File[] = useCurrentFileOnly
    ? activeFile
      ? [activeFile]
      : []
    : storedLlmFiles.map((file) => file.originalFile);

  //  STT: single-screen controlled file state
  //
  // We own the file here so both the STTInputStep (picker) and the transcript
  // output area can live on the same screen without a "Continue" gate between
  // them.  STTInputValue is derived on the fly when ExecuteButton needs it.
  const [sttFile, setSttFile] = useState<File | null>(null);

  //  TTS: single-screen text state
  //
  // The TTS test screen provides its own textarea so the user can type or edit
  // the synthesis input directly, without closing the test panel to update the
  // node form.  Pre-filled from formData when available.
  const [ttsText, setTtsText] = useState<string>(
    (formData["InputText"] as string) ?? "",
  );

  useEffect(() => {
    setTtsText((formData["InputText"] as string) ?? "");
  }, [formData["InputText"]]);

  // Select the right mutation based on node type
  const activeMutation =
    providerType === "stt"
      ? sttMutation
      : providerType === "tts"
        ? ttsMutation
        : llmMutation;

  const { mutate, isPending, data, reset } = activeMutation;

  // Reset mutation when user comes to Test tab
  useEffect(() => {
    if (selectedTab == "Test") reset();
  }, [selectedTab]);

  // Derive STTInputValue from the controlled file — passed straight to
  // ExecuteButton which builds the network payload from it.
  const sttInput: STTInputValue | undefined = sttFile
    ? { mode: "file", file: sttFile, audio_format: sttFile.type || "audio/wav" }
    : undefined;

  //  STT: single-screen (file picker above, transcript below)
  if (providerType === "stt") {
    const sttData = data as unknown as STTResponseDto | undefined;

    return (
      <DCPTabsContent
        tabValue="Test"
        footer={
          <ExecuteButton
            isPending={isPending}
            mutate={mutate}
            formData={formData}
            providerType="stt"
            sttInput={sttInput}
          />
        }
      >
        <div className="flex flex-col gap-4 p-3">
          {/*  Audio input: drop zone → compact preview  */}
          <div>
            <SectionLabel>Audio Input</SectionLabel>
            {/*
             * STTInputStep is now a controlled component: it calls onFileChange
             * rather than onNext, so there is no intermediate "Continue" screen.
             * When a file is chosen it shows the compact AudioPlayer row so the
             * user can preview and swap it out without leaving the test tab.
             */}
            <STTInputStep file={sttFile} onFileChange={setSttFile} />
          </div>

          {/*  Transcript output  */}
          <div>
            <SectionLabel>Transcript</SectionLabel>
            <div className="overflow-hidden rounded-lg border border-border/50">
              {isPending ? (
                <div className="p-3">
                  <JsonViewerSkeleton />
                </div>
              ) : sttData ? (
                <div className="p-3">
                  <STTResultPanel data={sttData} />
                </div>
              ) : (
                <Textarea
                  rows={8}
                  disabled
                  placeholder="Execute to generate transcript…"
                  className="border-0 rounded-none resize-none focus-visible:ring-0"
                />
              )}
            </div>
          </div>
        </div>
      </DCPTabsContent>
    );
  }

  //  TTS: single-screen (text input above, audio output below)
  if (providerType === "tts") {
    const ttsData = data as unknown as TTSResponseDto | undefined;

    return (
      <DCPTabsContent
        tabValue="Test"
        footer={
          <ExecuteButton
            isPending={isPending}
            mutate={mutate}
            formData={formData}
            providerType="tts"
            /*
             * Pass the local textarea value as the override so the payload
             * builder uses what the user typed rather than the stale formData
             * value from the node config panel.
             */
            ttsInputOverride={ttsText}
          />
        }
      >
        <div className="flex flex-col gap-4 p-3">
          {/*  Text to synthesize  */}
          <div>
            <SectionLabel>Text to Synthesize</SectionLabel>
            <Textarea
              rows={6}
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Enter the text you want to convert to speech…"
              className="resize-none"
            />
          </div>

          {/*  Audio output  */}
          <div>
            <SectionLabel>Generated Audio</SectionLabel>
            <div className="overflow-hidden rounded-lg border border-border/50">
              {isPending ? (
                <div className="p-3">
                  <JsonViewerSkeleton />
                </div>
              ) : ttsData?.output ? (
                <div className="p-3">
                  {/*
                   * Pass format from the response when available; fall back to
                   * audio/mpeg (the most common TTS output format).
                   * autoPlay is intentionally false — the user clicks play when
                   * they're ready to listen.
                   */}
                  <AudioPlayer
                    src={ttsData.output}
                    format="audio/mpeg"
                    title="Generated Speech"
                    autoPlay={false}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
                  Audio will appear here after execution
                </div>
              )}
            </div>
          </div>
        </div>
      </DCPTabsContent>
    );
  }

  //  LLM: single-screen (File Upload above, Execution below)

  const llmData = data as unknown as LLMResponseDto | undefined;

  const renderLLMOutput = () => {
    if (isPending) return <JsonViewerSkeleton />;

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
      <JsonViewer
        jsonData={llmData?.output ?? JSON.stringify(formData, null, 2)}
        className="h-[calc(64vh)]"
        enableCopy
      />
    );
  };
  return (
    <DCPTabsContent
      tabValue="Test"
      footer={
        <ExecuteButton
          isPending={isPending}
          mutate={mutate}
          formData={formData}
          providerType="llm"
          llmFiles={llmFilesToExecute}
        />
      }
    >
      <div className="flex flex-col gap-4 p-1">
        {/* Render Dropzone + Store Managed Files directly on the screen */}
        <FileUploadStep />
        {storedLlmFiles.length > 1 && (
          <CustomCheckbox
            checked={useCurrentFileOnly}
            label="Execute active file only"
            description="Limits execution to the currently open file in the viewer instead of all uploaded files."
            onCheckedChange={setUseCurrentFileOnly}
          />
        )}
        <div>
          <SectionLabel> {data || isPending ? "Output" : "Input"}</SectionLabel>
          <div className="overflow-hidden border border-solid rounded-lg border-dividers">
            {renderLLMOutput()}
          </div>
        </div>
      </div>
    </DCPTabsContent>
  );
};

export default ModelTestContent;
