import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { Button } from "@aventisia/ui/buttons";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";

import { useFetchQueues } from "../../hooks/useFetchQueues";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { useQueueBackLink } from "../../hooks/useQueueBackLink";
import { EmailWorkItem } from "./email-type-work-item/EmailWorkItem";
import FileWorkItem from "./file-type-work-item/FileWorkItem";

type QueueWorkItemType = "Email" | "File";

export const WorkItemDetails = () => {
  const { queueName } = useMyQueueParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [workItemType, setWorkItemtype] = useState<QueueWorkItemType>("File");
  const { data: queues } = useFetchQueues({ onlyUserQueues: false });
  const backToList = useQueueBackLink();

  // Function to render  queue workItem component based on type
  const renderWorkItemComponent = () => {
    switch (workItemType) {
      case "Email":
        return <EmailWorkItem />;
      case "File":
        return <FileWorkItem />;
      default:
        return <></>;
    }
  };
  return (
    <div className="space-y-4 h-full p-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to={backToList}>My Queues</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate capitalize">
                  {queueName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>
        <div className="flex items-center gap-2">
          <SearchableSelect
            options={
              queues?.data?.map((q) => ({
                value: q.id,
                label: q.name,
              })) ?? []
            }
            placeholder="Route to..."
            // value={queueId ?? undefined}
            onValueChange={() => {}}
            className="w-60"
            size="sm"
          />
          <Button size={"xs"}> Close</Button>
        </div>
      </div>
      {renderWorkItemComponent()}
    </div>
  );
};
