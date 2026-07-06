import { AutosizeTextarea } from "@aventisia/ui";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import CustomCheckbox from "@/components/CustomCheckbox";
import { JsonViewer } from "@/components/json-viewer/JsonViewer";
import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import {
  LLMRequestDto,
  LLMResponseDto,
} from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { useLLMExecute } from "@/features/dynamic-config-panel/hooks/node-test-tab/useLLMExecute";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

import FileUploadStep from "./FileUploadStep";
import { SectionLabel } from "./SectionLabel";
import { TestTabExecuteButton } from "./TestTabExecuteButton";

/** Shared test screen for the Inferencing and Conversation AI agent nodes. */
const LLMTestContent = ({
  formData,
}: {
  formData: Record<string, unknown>;
}) => {
  const [useCurrentFileOnly, setUseCurrentFileOnly] = useState(true);
  const [userPrompt, setUserPrompt] = useState("");

  // Payload preview shown before execution — kept in sync with userPrompt
  // via the effect below so it always reflects what Execute would send.
  const [previewPayload, setPreviewPayload] = useState<LLMRequestDto | null>(
    null,
  );

  const { files: storedFiles, activeFileId } = useLocalFileStore(
    useShallow((state) => ({
      activeFileId: state.activeFileId,
      files: state.files,
    })),
  );

  const activeFile = storedFiles.find(
    (f) => f.id === activeFileId,
  )?.originalFile;

  const filesToExecute: File[] = useCurrentFileOnly
    ? activeFile
      ? [activeFile]
      : []
    : storedFiles.map((f) => f.originalFile);

  const { isPending, data, buildPayload, execute } = useLLMExecute(
    formData,
    filesToExecute,
  );
  const llmData = data as unknown as LLMResponseDto | undefined;

  // Recompute the preview whenever the user prompt, base formData, or file
  // selection changes, reusing the exact same builder the Execute button
  // calls — so preview and actual request can never drift apart.
  useEffect(() => {
    if (data || isPending) return; // don't clobber output once executed

    let cancelled = false;
    buildPayload(userPrompt).then((payload) => {
      if (!cancelled) setPreviewPayload(payload);
    });

    return () => {
      cancelled = true;
    };
  }, [userPrompt, formData, filesToExecute.length, data, isPending]);

  const renderOutput = () => {
    if (isPending) return <JsonViewerSkeleton />;

    if (llmData) {
      return (
        <JsonViewer
          jsonData={
            llmData.is_json_output
              ? JSON.stringify(llmData.output ?? {})
              : (llmData.output ?? JSON.stringify(formData, null, 2))
          }
          className="h-[calc(64vh)]"
          enableClipboard
        />
      );
    }

    // Pre-execution: show the actual request payload the user is about to send.
    return (
      <JsonViewer
        jsonData={JSON.stringify(previewPayload ?? {}, null, 2)}
        className="h-[calc(64vh)]"
        enableClipboard
      />
    );
  };

  return (
    <DCPTabsContent
      tabValue="Test"
      footer={
        <TestTabExecuteButton
          isPending={isPending}
          onExecute={() => execute(userPrompt)}
        />
      }
    >
      <div className="flex flex-col gap-4 p-1">
        <AutosizeTextarea
          minHeight={5}
          rows={5}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Enter text here"
          className="!min-h-20"
        />

        <FileUploadStep />

        {storedFiles.length > 1 && (
          <CustomCheckbox
            checked={useCurrentFileOnly}
            label="Execute active file only"
            description="Limits execution to the currently open file in the viewer instead of all uploaded files."
            onCheckedChange={setUseCurrentFileOnly}
          />
        )}

        <div>
          <SectionLabel>
            {data || isPending ? "Output" : "Request Payload"}
          </SectionLabel>
          <div className="overflow-hidden border border-solid rounded-lg border-dividers">
            {renderOutput()}
          </div>
        </div>
      </div>
    </DCPTabsContent>
  );
};

export default LLMTestContent;
