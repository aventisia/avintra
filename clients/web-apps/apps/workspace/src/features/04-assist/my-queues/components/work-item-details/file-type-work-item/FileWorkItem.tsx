import { Dispatch, SetStateAction, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import FileViewer from "@/react-toolkit/features/file-viewer/components/FileViewer";
import { useLocalFileStore } from "@/react-toolkit/features/file-viewer/stores/file-list-store";

import { QueueWorkItemDto } from "../../../dtos/queue-work-item-dto";
import { InputSchemaField } from "../../../dtos/queues-table-dto";
import { WorkItemOutputPane } from "../shared/WorkItemOutputPane";

export default function FileWorkItem({
  data,
  credentialId,
  extractedData,
  setExtractedData,
  inputSchema,
}: {
  data?: QueueWorkItemDto;
  extractedData: string | undefined;
  credentialId?: string;
  inputSchema?: InputSchemaField[] | null;
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

      <WorkItemOutputPane
        data={data}
        extractedData={extractedData}
        setExtractedData={setExtractedData}
        inputSchema={inputSchema}
      />
    </div>
  );
}
