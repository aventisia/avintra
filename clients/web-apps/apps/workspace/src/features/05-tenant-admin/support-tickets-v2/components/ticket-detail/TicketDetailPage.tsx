import { Skeleton } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { Button } from "@avplatform/ui/buttons";
import { formatDate } from "@avplatform/ui/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "sonner";

import { TICKET_STATUS_VARIANT } from "../../constants/constants";
import { TicketDto } from "../../dtos/TicketDto";
import { useFetchTicket } from "../../hooks/useFetchTickets";
import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";
import { AttachmentSection } from "../attachment-section/AttachmentSection";
import { CommentThread } from "../comment-thread/CommentThread";
import { TriagePanel } from "../triage-panel/TriagePanel";

interface TicketDetailPageProps {
  api: TicketDetailApiAdapter;
  showTriage?: boolean;
  showStatusAction?: boolean;
  listPath?: string;
}

const metadataRows = (ticket: TicketDto) => [
  { label: "Ticket number", value: ticket.ticketNumber || "-" },
  {
    label: "Request type",
    value: ticket.requestType === "ChangeRequest" ? "Change Request" : "Service Request",
  },
  {
    label: "Status",
    value: ticket.status || "-",
    badge: ticket.status
      ? { text: ticket.status, variant: TICKET_STATUS_VARIANT[ticket.status] ?? "secondary" }
      : undefined,
  },
  { label: "Required by", value: ticket.requiredBy ? formatDate(ticket.requiredBy) : "-" },
  { label: "Created by", value: ticket.createdBy || "-" },
  { label: "Created on", value: ticket.createdOn ? formatDate(ticket.createdOn) : "-" },
  { label: "Last modified by", value: ticket.lastModifiedBy || "-" },
  {
    label: "Last modified on",
    value: ticket.lastModifiedOn ? formatDate(ticket.lastModifiedOn) : "-",
  },
];

const changeRequestRows = (ticket: TicketDto) => [
  ...(ticket.agentName ? [{ label: "Agent", value: ticket.agentName }] : []),
  ...(ticket.changeSummary ? [{ label: "Change summary", value: ticket.changeSummary }] : []),
  ...(ticket.changeReason ? [{ label: "Change reason", value: ticket.changeReason }] : []),
  ...(ticket.expectedBehavior
    ? [{ label: "Expected behavior", value: ticket.expectedBehavior }]
    : []),
  ...(ticket.requestedTimeline
    ? [{ label: "Requested timeline", value: formatDate(ticket.requestedTimeline) }]
    : []),
];

export const TicketDetailPage = ({
  api,
  showTriage = false,
  showStatusAction = false,
  listPath = "/tenant/support/tickets",
}: TicketDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading } = useFetchTicket(id || "");

  const ticket = data?.data;

  const invalidateTicketQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["support-ticket-v2", id] });
    queryClient.invalidateQueries({ queryKey: ["sa-support-ticket", id] });
    queryClient.invalidateQueries({ queryKey: ["sa-support-tickets"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: "InProgress" | "Closed") =>
      api.updateTicketStatus({ ticketId: id || "", status }),
    onSuccess: (res) => {
      if (res.data) {
        toast.success(
          res.data.status === "Closed" ? "Ticket closed" : "Ticket marked as in progress",
        );
        invalidateTicketQueries();
      } else {
        toast.error(res.message || "Failed to update ticket status");
      }
    },
    onError: () => toast.error("Failed to update ticket status"),
  });

  if (!id) return <div className="p-6 text-sm text-muted-foreground">Ticket not found</div>;
  if (isLoading) return <Skeleton className="m-6 h-96 w-[calc(100%-3rem)]" />;
  if (!ticket) return <div className="p-6 text-sm text-muted-foreground">Ticket not found</div>;

  const isCR = ticket.requestType === "ChangeRequest";
  const crRows = changeRequestRows(ticket);
  const isClosed = ticket.status === "Closed";

  return (
    <div className="space-y-4 h-full pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to={listPath}>Support tickets</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate">{ticket.ticketNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>
        {showStatusAction && !isClosed && ticket.status && (
          <div className="flex items-center gap-2">
            {ticket.status === "New" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => statusMutation.mutate("InProgress")}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? "Updating..." : "Mark as In Progress"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => statusMutation.mutate("Closed")}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? "Closing..." : "Close Ticket"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-background px-5 py-3.5">
        <div className="mb-3">
          <h1 className="text-title text-ink">{ticket.title}</h1>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {metadataRows(ticket).map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 rounded-md">
              <span className="text-2xs uppercase tracking-wide text-muted-foreground">
                {row.label}
              </span>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium break-all">{row.value}</span>
                {row.badge && <Badge variant={row.badge.variant}>{row.badge.text}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-background px-5 py-3.5">
        <h3 className="text-sm font-semibold mb-3">Description</h3>
        <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {isCR && crRows.length > 0 && (
        <div className="rounded-lg border bg-background px-5 py-3.5">
          <h3 className="text-sm font-semibold mb-3">Change request details</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {crRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <span className="text-2xs uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </span>
                <span className="text-sm font-medium break-all">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTriage && isCR && (
        <div className="rounded-lg border bg-background px-5 py-3.5">
          <TriagePanel ticket={ticket} api={api} />
        </div>
      )}

      <div className="rounded-lg border bg-background px-5 py-3.5">
        <AttachmentSection
          ticketId={ticket.id || ""}
          attachments={ticket.attachments || []}
          api={api}
          isClosed={isClosed}
        />
      </div>

      <div className="rounded-lg border bg-background px-5 py-3.5">
        <CommentThread
          ticketId={ticket.id || ""}
          comments={ticket.comments || []}
          api={api}
          isClosed={isClosed}
        />
      </div>
    </div>
  );
};
