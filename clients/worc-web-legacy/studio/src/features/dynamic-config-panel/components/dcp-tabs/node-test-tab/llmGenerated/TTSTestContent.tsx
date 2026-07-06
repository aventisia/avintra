import { Textarea } from "@aventisia/ui";
import { useEffect, useState } from "react";

import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { TTSResponseDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { useTTSExecute } from "@/features/dynamic-config-panel/hooks/node-test-tab/useTTSExecute";

import AudioPlayer from "./AudioPlayer";
import { SectionLabel } from "./SectionLabel";
import { TestTabExecuteButton } from "./TestTabExecuteButton";

/** Dedicated test screen for the Text-to-Speech AI agent node. */
const TTSTestContent = ({
  formData,
}: {
  formData: Record<string, unknown>;
}) => {
  const [ttsText, setTtsText] = useState<string>(
    (formData["InputText"] as string) ?? "",
  );

  // Keep the local textarea in sync if InputText changes upstream (e.g. the
  // user edits the node config panel while this screen stays mounted).
  useEffect(() => {
    setTtsText((formData["InputText"] as string) ?? "");
  }, [formData["InputText"]]);

  const { isPending, data, execute } = useTTSExecute(formData);
  const ttsData = data as unknown as TTSResponseDto | undefined;

  return (
    <DCPTabsContent
      tabValue="Test"
      footer={
        <TestTabExecuteButton
          isPending={isPending}
          onExecute={() => execute(ttsText)}
        />
      }
    >
      <div className="flex flex-col gap-4 p-3">
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

        <div>
          <SectionLabel>Generated Audio</SectionLabel>
          <div className="overflow-hidden rounded-lg border border-border/50">
            {isPending ? (
              <div className="p-3">
                <JsonViewerSkeleton />
              </div>
            ) : ttsData?.output ? (
              <div className="p-3">
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
};

export default TTSTestContent;
