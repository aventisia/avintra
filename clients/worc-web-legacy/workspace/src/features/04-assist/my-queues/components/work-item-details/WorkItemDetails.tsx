import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { Button } from "@aventisia/ui/buttons";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { QueueViewTypeEnum } from "../../enums/queue-view-type-enum";
// import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";

import { QueueTransactionStatusTypesEnum } from "../../enums/queue-work-item-status-enum";
import { useFetchQueues } from "../../hooks/useFetchQueues";
import { useFetchQueuesWorkItemData } from "../../hooks/useFetchQueuesWorkItemData";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { useQueueBackLink } from "../../hooks/useQueueBackLink";
import { useUpdateWorkItemMutation } from "../../hooks/useUpdateWorkItemMutation";
import { EmailWorkItem } from "./email-type-work-item/EmailWorkItem";
import FileWorkItem from "./file-type-work-item/FileWorkItem";

export const WorkItemDetails = () => {
  const navigate = useNavigate();
  const { queueName, workItemId, queueId } = useMyQueueParams();
  const { data: myQueues } = useFetchQueues({ onlyUserQueues: true });

  const [workItemType, setWorkItemtype] = useState<QueueViewTypeEnum>(
    QueueViewTypeEnum.DocumentProcessing,
  );

  //   const { data: queues } = useFetchQueues({ onlyUserQueues: false });
  const backToList = useQueueBackLink();
  const { data } = useFetchQueuesWorkItemData(workItemId ?? "");

  // Bring in the mutation hook to log the completion event
  const { mutate: closeWorkItem, isPending: isClosing } =
    useUpdateWorkItemMutation();

  const handleClose = () => {
    if (!workItemId) return;

    closeWorkItem(
      {
        id: workItemId,
        queueId: queueId ?? "",
        status: QueueTransactionStatusTypesEnum.Completed,
      },
      {
        onSuccess: () => {
          // On successful close, take the user back to the queues list
          navigate(backToList);
        },
      },
    );
  };

  useEffect(() => {
    const viewType = myQueues?.data.find(
      (item) => item.id == queueId,
    )?.viewType;
    if (viewType) {
      setWorkItemtype(viewType);
    }
    return () => {};
  }, [myQueues?.data, queueId]);

  const renderWorkItemComponent = () => {
    switch (workItemType) {
      case QueueViewTypeEnum.EmailProcessing:
        return <EmailWorkItem />;
      case QueueViewTypeEnum.DocumentProcessing:
        return <FileWorkItem data={data?.data} />;
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
                  {data?.data.queueName ?? queueName}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate capitalize">
                  {(data?.data.id ?? workItemId)?.slice(0, 8) + "..."}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>

        <div className="flex items-center gap-2">
          {/* <SearchableSelect
            options={
              queues?.data?.map((q) => ({
                value: q.id,
                label: q.name,
              })) ?? []
            }
            placeholder="Route to..."
            onValueChange={() => {}}
            className="w-60"
            size="sm"
          /> */}
          <Button
            size="xs"
            onClick={handleClose}
            disabled={isClosing || !workItemId}
          >
            {isClosing ? "Closing..." : "Close"}
          </Button>
        </div>
      </div>

      {renderWorkItemComponent()}
    </div>
  );
};
