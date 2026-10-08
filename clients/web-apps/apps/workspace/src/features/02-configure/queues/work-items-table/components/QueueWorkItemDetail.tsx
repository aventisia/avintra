import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { CopyButton } from "@avplatform/ui/buttons";
import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { useMemo, useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import FileWorkItem from "@/features/04-assist/my-queues/components/work-item-details/file-type-work-item/FileWorkItem";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { InputSchemaField } from "../../queues-table/dtos/queues-table-dto";
import { useFetchAllQueues } from "../../queues-table/hooks/useFetchQueues";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";
import { useFetchQueuesWorkItemById } from "../hooks/useFetchQueuesWorkItemById";

/**
 * Renders the full detail of a single work item for a queue in the Configure
 * section: the file viewer on the left and the extracted output (JSON ⇄ Form
 * toggle) plus the activity timeline on the right, mirroring the Assist
 * "My Queues → Work Items → Open" experience.
 */
export const QueueWorkItemDetail = () => {
  const { qid: queueId = "", wid: workItemId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const queueName = searchParams.get("name") ?? "WorkItem";

  const [extractedData, setExtractedData] = useState<string>();

  // Fetch the selected work item's full payload by its ID.
  const { data: workItemData, isLoading } = useFetchQueuesWorkItemById(workItemId);

  // The configure queue list includes the full input schema (with array fields)
  // and the credential name, both needed by the form and file viewers. The
  // detail screen is reachable from both the Personal and Shared queues tab,
  // so the queue is resolved against both lists.
  const { data: queuesData } = useFetchAllQueues();
  const queue = useMemo(
    () => queuesData?.data?.find((item) => item.id === queueId),
    [queuesData?.data, queueId],
  );
  const { actions, isProd } = useConfigureResourceAccessActions(
    queue?.accessLevel ?? ResourceAccessTypeEnum.View,
  );

  const inputSchema = queue?.inputSchema;
  const credentialName = queue?.credentialName;
  const hasOnlyReadAccess = isProd ? !actions.update : queue?.accessLevel === "View";

  const workItem: QueueWorkItemDto | undefined = workItemData?.data;

  const [copied, setCopied] = useState(false);
  const handleCopyWorkItemId = () => {
    if (!workItemId) return;
    navigator.clipboard.writeText(workItemId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (!workItem) {
    return (
      <div className="space-y-4 pt-4">
        <p className="text-sm text-muted-foreground">Work item not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to="/configure/queues/">Queues</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink
                    to={`/configure/queues/work-items/${queueId}?name=${encodeURIComponent(queueName)}`}
                  >
                    {queueName}
                  </NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate capitalize">
                  {workItem.id?.slice(0, 8) + "..."}
                </BreadcrumbPage>
                <CopyButton
                  isCopied={copied}
                  onClick={handleCopyWorkItemId}
                  className="ml-1"
                  aria-label="Copy work item ID"
                />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>
      </div>

      <FileWorkItem
        data={workItem}
        extractedData={extractedData}
        setExtractedData={setExtractedData}
        credentialName={credentialName}
        inputSchema={inputSchema as InputSchemaField[] | null}
        readOnly={hasOnlyReadAccess}
      />
    </div>
  );
};
