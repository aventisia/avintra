import { DotSeparator, Separator } from "@avplatform/ui";
import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { formatDistanceToNow } from "date-fns";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { useFetchSupportTicket } from "../../hooks/useFetchSupportTicket";
import { STRemarkRowActions } from "../st-remark-row-actions/STRemarkRowActions";
import { STRemarkEditForm } from "../support-ticket-remark/STRemarkEditForm";
import { STRemarkForm } from "../support-ticket-remark/STRemarkForm";
import { STDetailsSideComponent } from "./STDetailsSideComponent";

export const SupportTicketDetailsPage = () => {
  useDocumentTitle("Support Ticket Details");

  // Get support ticket id from URL params
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Fetch support ticket data
  const { data, isFetching, isLoading, refetch } = useFetchSupportTicket(id);

  // State to store remarks and remark count
  const [remarks, setRemarks] = useState<SupportTicketRemarksDto[]>(
    data?.data?.supportTicketRemarks ?? [],
  );
  const [remarkCount, setRemarkCount] = useState<number>(data?.data?.remarkCount ?? 0);

  // Update state when data changes
  useEffect(() => {
    if (data?.data) {
      setRemarks(data.data.supportTicketRemarks ?? []);
      setRemarkCount(data.data.remarkCount ?? 0);
    }
  }, [data]);

  // Re-fetch data when remarkCount changes
  useEffect(() => {
    refetch(); // Refetch support ticket data when remarkCount changes
  }, [remarkCount, refetch]);

  // State to store the id of the comment being edited
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Handler to cancel editing
  const handleCancel = () => {
    setEditingCommentId(null);
  };

  // Handler for editing a remark
  const handleEditRemark = () => {
    // Call refetch to ensure the data is refreshed from the server
    refetch();
  };

  // Handler for submitting the form (create/update comment)
  const handleFormSubmit = async () => {
    await refetch(); // Refetch data after form submission
    setEditingCommentId(null); // Reset editing state
  };

  // Handler for deleting a remark
  const handleDeleteRemark = (deletedRemarkId: string) => {
    // Filter out the deleted remark from local state
    setRemarks(remarks.filter((remark) => remark.id !== deletedRemarkId));
    setRemarkCount(remarkCount - 1);
    // Optionally call refetch to ensure the data is refreshed from the server
    refetch();
  };

  // Show skeleton while loading or fetching data
  if (isLoading || isFetching) {
    return <DataTableSkeleton />;
  }

  // If no data is available, you might want to handle this case explicitly
  if (!data?.data) {
    return <p>No data available</p>;
  }

  const { subject, ticketNumber, status, createdOn, description } = data.data;

  return (
    <div className="flex h-screen px-[3%] py-[3%]">
      <div className="main-component flex w-full flex-col items-start">
        <div>
          <span className="text-2xl">{subject}</span>{" "}
          <span className="font-light">{`(${ticketNumber})`}</span>
        </div>
        <div className="my-4 text-sm text-gray-500">
          <span className="mr-2 rounded-2xl border px-4 py-2">{status}</span>
          <span>
            Ticket opened{" "}
            {formatDistanceToNow(createdOn ?? new Date(), {
              addSuffix: true,
            })}
          </span>
          <DotSeparator />
          <span>{remarkCount} comments</span>
        </div>
        <Separator />
        <div className="my-8">
          <div>
            <p className="p-2">Message</p>
          </div>
          <Separator />
          <div className="w-full p-2 text-base font-light">{parse(description ?? "")}</div>
        </div>
        {remarkCount > 0 && (
          <div className="my-6 w-full">
            <div>
              <p className="p-2">Comments</p>
            </div>
            <Separator />
            <div className="w-full p-2">
              {remarks.map((remark) => (
                <div key={remark.id} className="relative my-4 w-full rounded-md border p-2">
                  <div className="mb-2 flex w-full items-center justify-between">
                    <p className="flex-1 text-sm text-gray-500">
                      {remark.userFullName} commented{" "}
                      {formatDistanceToNow(remark.createdOn ?? new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                    <STRemarkRowActions
                      rowId={remark.id}
                      setEditingCommentId={setEditingCommentId}
                      remarkCount={remarkCount}
                      setRemarkCount={setRemarkCount}
                      onDelete={() => handleDeleteRemark(remark.id)}
                      onEdit={handleEditRemark}
                    />
                  </div>
                  {editingCommentId === remark.id ? (
                    <STRemarkEditForm
                      id={remark.id}
                      refetch={handleFormSubmit}
                      initialContent={remark.message}
                      onCancel={handleCancel}
                    />
                  ) : (
                    <div className="w-full">{parse(remark.message ?? "")}</div>
                  )}
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}
        <STRemarkForm
          id={id}
          remarkCount={remarkCount}
          setRemarkCount={setRemarkCount}
          refetch={handleFormSubmit}
        />
      </div>
      <div>
        <STDetailsSideComponent />
      </div>
    </div>
  );
};
