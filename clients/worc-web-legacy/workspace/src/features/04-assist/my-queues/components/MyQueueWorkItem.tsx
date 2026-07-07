import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { Button } from "@aventisia/ui/buttons";
import parse from "html-react-parser";
import { NavLink } from "react-router-dom";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";
import { sanitizeHtml } from "@/features/05-tenant-admin/support-tickets-table/utils/htmlSanitizer";

import { useFetchQueues } from "../hooks/useFetchQueues";
import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { useQueueBackLink } from "../hooks/useQueueBackLink";
import AttachmentsSection from "./AttachmentSection";
import WorkflowTimeline from "./WorkflowTimeline";

export const WorkItemDetails = () => {
  const { queueName } = useMyQueueParams();

  const { data: queues } = useFetchQueues({ onlyUserQueues: false });
  const backToList = useQueueBackLink();
  const htmlString = `<div style=" padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;"><p style="margin: 0 0 16px 0; font-size: 12px;">Please review, verify or approve the following details:</p><ol style="margin: 0; padding-left: 16px; "><li style="margin-bottom: 8px;"><a href="#contact-persons" style="color: #9b87f5; text-decoration: underline; font-size: 12px;">Contact Persons</a></li><li style="margin-bottom: 8px;"><a href="#documents" style="color: #9b87f5; text-decoration: underline; font-size: 12px;">Documents</a></li><li style="margin-bottom: 8px;"><a href="#trade-partners" style="color: #9b87f5; text-decoration: underline; font-size: 12px;">Trade Partners</a></li></ol></div>`;

  return (
    <div className="space-y-4 p-4">
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
      {/* Debug / placeholder content */}
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="w-full max-w-4xl rounded-lg border bg-accent p-2 text-sm">
          {parse(sanitizeHtml(htmlString))}
        </div>
        <AttachmentsSection />
        <WorkflowTimeline />
      </div>
    </div>
  );
};
