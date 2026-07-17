import { ScrollArea } from "@aventisia/ui/scroll";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { JsonEditor } from "@/components/json-editor/JsonEditor";
import FileViewer from "@/react-toolkit/features/file-viewer/components/FileViewer";
import { useLocalFileStore } from "@/react-toolkit/features/file-viewer/stores/file-list-store";

import { QueueWorkItemDto } from "../../../dtos/queue-work-item-dto";
import { QueueTransactionStatusTypesEnum } from "../../../enums/queue-work-item-status-enum";
import WorkflowTimeline from "../email-type-work-item/WorkflowTimeline";

export default function FileWorkItem({
  data,
  credentialId,
  extractedData,
  setExtractedData,
}: {
  data?: QueueWorkItemDto;
  extractedData: string | undefined;
  credentialId?: string;
  setExtractedData: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { addFileUrls, clearAllFiles } = useLocalFileStore(
    useShallow((state) => ({
      addFileUrls: state.addFileUrls,
      clearAllFiles: state.clearAllFiles,
    })),
  );

  useEffect(() => {
    if (!data?.fileUrls) return;

    addFileUrls(
      data.fileUrls.map((url) => ({
        url,
        requiresProxy: true,
        credentialId,
      })),
    );

    return () => {
      clearAllFiles();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.fileUrls]);

  useEffect(() => {
    if (!data?.workItemData) return;

    setExtractedData(data?.workItemData);

    return () => {
      setExtractedData("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.workItemData]);

  return (
    <div className="grid gap-3 grid-cols-2">
      <div className="border h-fit rounded-lg">
        <FileViewer allowDelete={false} />
      </div>

      <ScrollArea className="h-[calc(100vh-4.5rem-var(--header-height)-2*var(--header-padding))] border rounded-lg bg-background p-3">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between px-1 pb-2">
              <h3 className="text-xs font-semibold">Extracted Output</h3>
            </div>
            <JsonEditor
              onChange={setExtractedData}
              value={extractedData}
              disabled={data?.status == QueueTransactionStatusTypesEnum.Completed}
            />
          </div>

          {data?.id && (
            <WorkflowTimeline
              workItemId={data.id}
              isCompleted={data.status == QueueTransactionStatusTypesEnum.Completed}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
