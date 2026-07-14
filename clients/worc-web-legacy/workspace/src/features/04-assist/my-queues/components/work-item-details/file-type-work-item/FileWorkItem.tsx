import { ScrollArea } from "@aventisia/ui/scroll";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { JsonEditor } from "@/components/json-editor/JsonEditor";
import FileViewer from "@/react-toolkit/features/file-viewer/components/FileViewer";
import { useLocalFileStore } from "@/react-toolkit/features/file-viewer/stores/file-list-store";

import { QueueWorkItemDto } from "../../../dtos/queue-work-item-dto";
import { QueueTransactionStatusTypesEnum } from "../../../enums/queue-work-item-status-enum";
import WorkflowTimeline from "../email-type-work-item/WorkflowTimeline";

export default function FileWorkItem({ data }: { data?: QueueWorkItemDto }) {
  const addFileUrls = useLocalFileStore(
    useShallow((state) => state.addFileUrls),
  );

  useEffect(() => {
    if (!data?.fileUrl) return;
    addFileUrls(Array.isArray(data.fileUrl) ? data.fileUrl : [data.fileUrl]);
  }, [addFileUrls, data?.fileUrl]);

  return (
    <div className="grid gap-3 grid-cols-2">
      <div className="border h-fit rounded-lg">
        <FileViewer />
      </div>

      <ScrollArea className="h-[calc(100vh-4.5rem-var(--header-height)-2*var(--header-padding))] border rounded-lg bg-background p-3">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between px-1 pb-2">
              <h3 className="text-xs font-semibold">Extracted Output</h3>
            </div>
            <JsonEditor value={data?.workItemData} />
          </div>

          {data?.id && (
            <WorkflowTimeline
              workItemId={data.id}
              isCompleted={
                data.status == QueueTransactionStatusTypesEnum.Completed
              }
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
