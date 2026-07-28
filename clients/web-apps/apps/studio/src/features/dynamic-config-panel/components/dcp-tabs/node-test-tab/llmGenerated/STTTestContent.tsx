import { Textarea } from "@avplatform/ui";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { STTResponseDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { useSTTExecute } from "@/features/dynamic-config-panel/hooks/node-test-tab/useSTTExecute";

import STTInputStep, { STTInputValue } from "./STTInputStep";
import { SectionLabel } from "./SectionLabel";
import { TestTabExecuteButton } from "./TestTabExecuteButton";

function STTResultPanel({ data }: { data: STTResponseDto }) {
  return (
    <div className="flex flex-col gap-3">
      {data.error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {data.error}
        </div>
      )}
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

/** Dedicated test screen for the Speech-to-Text AI agent node. */
const STTTestContent = ({
  formData,
}: {
  formData: Record<string, unknown>;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { isPending, data, execute } = useSTTExecute(formData);
  const sttData = data as unknown as STTResponseDto | undefined;

  const sttInput: STTInputValue | undefined = file
    ? { mode: "file", file, audio_format: file.type || "audio/wav" }
    : undefined;

  return (
    <DCPTabsContent
      tabValue="Test"
      footer={
        <TestTabExecuteButton
          isPending={isPending}
          onExecute={() => execute(sttInput)}
        />
      }
    >
      <div className="flex flex-col gap-4 p-3">
        <div>
          <SectionLabel>Audio Input</SectionLabel>
          <STTInputStep file={file} onFileChange={setFile} />
        </div>

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
};

export default STTTestContent;
