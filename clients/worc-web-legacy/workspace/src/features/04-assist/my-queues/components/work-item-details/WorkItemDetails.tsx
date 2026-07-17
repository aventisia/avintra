import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { QueueTransactionEventEnum } from "../../enums/queue-transaction-event-enum";
import { QueueViewTypeEnum } from "../../enums/queue-view-type-enum";
import { QueueTransactionStatusTypesEnum } from "../../enums/queue-work-item-status-enum";
import { useFetchQueues } from "../../hooks/useFetchQueues";
import { useFetchQueuesWorkItemData } from "../../hooks/useFetchQueuesWorkItemData";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { useQueueBackLink } from "../../hooks/useQueueBackLink";
import { useInsertQueueWorkItemEvent } from "../../hooks/useQueueTransactionEvents";
import { useRouteWorkItemMutation } from "../../hooks/useRouteWorkItemMutation";
import { useUpdateWorkItemMutation } from "../../hooks/useUpdateWorkItemMutation";
import { EmailWorkItem } from "./email-type-work-item/EmailWorkItem";
import FileWorkItem from "./file-type-work-item/FileWorkItem";

export const WorkItemDetails = () => {
  const { queueName, workItemId, queueId } = useMyQueueParams();
  const [myCurrentQueue, setMyCurrentQueue] = useState<QueuesTableDto>();
  const [extractedData, setExtractedData] = useState<string>();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { showCustomAlertDialog } = useShowAlertHandler();

  const backToList = useQueueBackLink();

  const { data: workItemData } = useFetchQueuesWorkItemData(workItemId ?? "");

  const { data: myQueues } = useFetchQueues({ onlyUserQueues: true });

  const { mutate: routeWorkItem } = useRouteWorkItemMutation();

  const { mutate: addEvent } = useInsertQueueWorkItemEvent();

  const { mutate: closeWorkItem, isPending: isClosePending } = useUpdateWorkItemMutation();

  const handleClose = () => {
    if (!workItemId || !workItemData?.data) return;

    closeWorkItem({
      ...workItemData?.data,
      workItemData: extractedData,
      status: QueueTransactionStatusTypesEnum.Completed,
    });
  };

  useEffect(() => {
    const queue = myQueues?.data.find((item) => item.id == queueId);
    if (queue) {
      setMyCurrentQueue(queue);
    }

    return () => {};
  }, [myQueues?.data, queueId]);

  // On Load of WorkItem detail if it is in pending state move to in progress
  useEffect(() => {
    if (!workItemId) return;

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
    workItemData?.data.status,
    userSession?.firstName,
    userSession?.lastName,
    workItemId,
  ]);

  const renderWorkItemComponent = () => {
    switch (myCurrentQueue?.viewType) {
      case QueueViewTypeEnum.EmailProcessing:
        return <EmailWorkItem />;
      case QueueViewTypeEnum.DocumentProcessing:
        return (
          <FileWorkItem
            data={workItemData?.data}
            extractedData={extractedData}
            setExtractedData={setExtractedData}
            credentialId={myCurrentQueue?.credentialId}
          />
        );
      default:
        return <></>;
    }
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
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>

        <div className="flex items-center gap-2">
          {myCurrentQueue?.routeToQueues &&
            workItemData?.data?.status !== QueueTransactionStatusTypesEnum.Completed && (
              <SearchableSelect
                options={
                  myCurrentQueue?.routeToQueues?.map((queueName) => ({
                    value: queueName,
                    label: queueName,
                  })) ?? []
                }
                placeholder="Route to..."
                onValueChange={(value) => {
                  showCustomAlertDialog({
                    confirmActionFn: () => {
                      routeWorkItem({ id: workItemId ?? "", queueName: value });
                    },
                    title: "Route Work Item",
                    description: `Are you sure you want to route the work item to ${value} ?`,
                    isDestructive: false,
                  });
                }}
                className="w-60"
                size="sm"
              />
            )}
          {workItemData?.data?.status !== QueueTransactionStatusTypesEnum.Completed && (
            <Button
              size="xs"
              onClick={() => {
                showCustomAlertDialog({
                  confirmActionFn: handleClose,
                  title: "Close Work Item",
                  description: "Are you sure you want to close the work item?",
                  isDestructive: false,
                });
              }}
              disabled={isClosePending}
            >
              {isClosePending ? "Closing..." : "Close"}
            </Button>
          )}
        </div>
      </div>

      {renderWorkItemComponent()}
    </div>
  );
};
