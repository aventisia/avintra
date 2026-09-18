import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { Button, CopyButton } from "@avplatform/ui/buttons";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";

import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { QueueTypesEnum } from "../../enums/queue-instance-type-enum";
import { QueueProcessingModeEnum } from "../../enums/queue-processing-mode-enum";
import { QueueTransactionEventEnum } from "../../enums/queue-transaction-event-enum";
import { QueueTransactionStatusTypesEnum } from "../../enums/queue-work-item-status-enum";
import { useFetchQueueByName } from "../../hooks/useFetchQueueByName";
import { useFetchQueues } from "../../hooks/useFetchQueues";
import { useFetchQueuesWorkItemData } from "../../hooks/useFetchQueuesWorkItemData";
import { useGetNextItemMutation } from "../../hooks/useGetNextItemMutation";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { useQueueBackLink } from "../../hooks/useQueueBackLink";
import { useInsertQueueWorkItemEvent } from "../../hooks/useQueueTransactionEvents";
import { useUpdateWorkItemMutation } from "../../hooks/useUpdateWorkItemMutation";
import FileWorkItem from "./file-type-work-item/FileWorkItem";

/**
 * Builds the disposition status options for a queue: only the custom disposition
 * statuses defined on the queue (the core system statuses are not shown here).
 */
const buildDispositionOptions = (queue?: QueuesTableDto) => {
  return (queue?.statuses ?? [])
    .filter((s) => s.name)
    .map((s) => ({ value: s.name, label: s.label || s.name }));
};

export const WorkItemDetails = () => {
  const { queueName, workItemId, queueId, queueType } = useMyQueueParams();
  const navigate = useNavigate();
  const [myCurrentQueue, setMyCurrentQueue] = useState<QueuesTableDto>();
  const [extractedData, setExtractedData] = useState<string>();
  const [selectedDisposition, setSelectedDisposition] = useState<string>();
  const [copied, setCopied] = useState(false);

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const backToList = useQueueBackLink();

  const { data: workItemData } = useFetchQueuesWorkItemData(workItemId ?? "");

  // Fetch the queue matching the current queue type. Agent-queue work items are
  // opened from agent queues, so we must query the agent-queue endpoint to
  // resolve the queue's credentialName (needed to download the file/PDF).
  const { data: myQueues } = useFetchQueues({ onlyUserQueues: true, queueType });

  // The my-queues list endpoints strip array-typed fields (e.g. `line_items`) from
  // the input schema, so the form would never render them. Resolve the complete
  // schema from the queue details endpoint (by name) instead.
  const resolvedQueueName = workItemData?.data.queueName ?? queueName;
  const { data: queueByName } = useFetchQueueByName(resolvedQueueName);

  const { mutate: addEvent } = useInsertQueueWorkItemEvent();

  const { mutate: closeWorkItem, isPending: isClosePending } = useUpdateWorkItemMutation();
  const { mutate: getNextItem, isPending: isClaimingNext } = useGetNextItemMutation();

  const workItemIdFull = workItemData?.data.id ?? workItemId ?? "";

  // Agent-queue work items are view-only: no claim/close controls and no comments.
  const isViewOnly = queueType === QueueTypesEnum.Agent;

  const handleCopyWorkItemId = () => {
    if (!workItemIdFull) return;
    navigator.clipboard.writeText(workItemIdFull).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  const isFifo = myCurrentQueue?.processingMode === QueueProcessingModeEnum.Fifo;

  // In FIFO mode, a user may only close the item they actually claimed via the
  // "Get Next Item" button (which sets the assignee to the current user). This
  // prevents a user from closing an arbitrary item in the list regardless of age.
  const currentUserDisplayName = userSession?.firstName + " " + userSession?.lastName;
  const canClose = !isFifo || workItemData?.data.assignee === currentUserDisplayName;

  const handleClose = () => {
    if (!workItemId || !workItemData?.data) return;

    // Close requires a disposition status to be selected.
    if (!selectedDisposition) return;

    closeWorkItem(
      {
        ...workItemData?.data,
        workItemData: extractedData,
        status: selectedDisposition,
      },
      {
        // On successful close: if the queue is FIFO, automatically claim and
        // open the next item; otherwise return to the queue work items screen.
        onSuccess: () => {
          if (isFifo) {
            getNextItem();
          } else {
            navigate(backToList);
          }
        },
      },
    );
  };

  const handleDispositionChange = (value: string) => {
    setSelectedDisposition(value);
  };

  useEffect(() => {
    const queue = myQueues?.data.find((item) => item.id == queueId);
    if (queue) {
      setMyCurrentQueue(queue);
    }

    return () => {};
  }, [myQueues?.data, queueId]);

  // Prefer the queue details payload (complete schema) over the list payload,
  // which omits array-typed fields such as `line_items`.
  const inputSchema = queueByName?.data?.inputSchema ?? myCurrentQueue?.inputSchema;

  // On Load of WorkItem detail if it is in pending state move to in progress.
  // This auto-claim only applies in Manual mode, where users free-pick items.
  // In FIFO mode items are claimed exclusively via the "Get Next Item" button,
  // so opening an item to view it must NOT mark it InProgress (otherwise an
  // abandoned item would be skipped by the FIFO claimer).
  //
  // IMPORTANT: myCurrentQueue is loaded asynchronously, so isFifo is false until
  // it resolves. We must wait for myCurrentQueue before deciding, otherwise the
  // effect would auto-claim a FIFO item on the initial render.
  useEffect(() => {
    if (!workItemId) return;
    if (!myCurrentQueue) return;
    if (isFifo) return;
    if (isViewOnly) return;

    if (workItemData?.data.status !== QueueTransactionStatusTypesEnum.Pending) return;
    else {
      addEvent({
        id: crypto.randomUUID(),
        queueTransactionId: workItemId || "",
        eventType: QueueTransactionEventEnum.StatusChange,
        data: "In Progress",
        createdOn: new Date().toISOString(),
        createdBy: userSession?.firstName + " " + userSession?.lastName,
      });
    }

    return () => {};
  }, [
    addEvent,
    isFifo,
    isViewOnly,
    myCurrentQueue,
    workItemData?.data.status,
    userSession?.firstName,
    userSession?.lastName,
    workItemId,
  ]);

  const renderWorkItemComponent = () => {
    // The work item viewer is now common/dynamic: it renders the file viewer on
    // the left (choosing the viewer by file extension) and the extracted output
    // + timeline on the right, regardless of the queue's business category.
    return (
      <FileWorkItem
        data={workItemData?.data}
        extractedData={extractedData}
        setExtractedData={setExtractedData}
        credentialName={myCurrentQueue?.credentialName}
        inputSchema={inputSchema}
        readOnly={isViewOnly}
      />
    );
  };

  return (
    <div className="space-y-4 h-full pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to={backToList}>Queues</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate capitalize">
                  {workItemData?.data.queueName ?? queueName}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate capitalize">
                  {(workItemData?.data.id ?? workItemId)?.slice(0, 8) + "..."}
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

        <div className="flex items-center gap-2">
          {!isViewOnly &&
            workItemData?.data?.status !== QueueTransactionStatusTypesEnum.Completed && (
              <SearchableSelect
                options={buildDispositionOptions(myCurrentQueue)}
                placeholder="Disposition Status"
                value={selectedDisposition}
                onValueChange={handleDispositionChange}
                className="w-60"
                size="sm"
                disabled={!canClose}
              />
            )}
          {!isViewOnly &&
            workItemData?.data?.status !== QueueTransactionStatusTypesEnum.Completed && (
              <Button
                size="xs"
                onClick={handleClose}
                disabled={isClosePending || isClaimingNext || !selectedDisposition || !canClose}
                title={
                  !canClose
                    ? "Claim this item via Get Next Item before closing it"
                    : !selectedDisposition
                      ? "Select a disposition status to close"
                      : undefined
                }
              >
                {isClosePending || isClaimingNext ? "Closing..." : "Close"}
              </Button>
            )}
        </div>
      </div>

      {renderWorkItemComponent()}
    </div>
  );
};
