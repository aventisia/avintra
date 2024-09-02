import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { useFetchSupportTicket } from "../../hooks/useFetchSupportTicket";
import { formatDistanceToNow } from "date-fns";
import { DotSeparator } from "@/react-toolkit/ui/custom/DotSeparator";
import { Separator } from "@/react-toolkit/ui/separator";
import { useEffect, useState } from "react";
import { SupportTicketsTableDto } from "../../dtos/SupportTicketsTableDto";
import { useLocation } from "react-router-dom";
import { STRemarkForm } from "../support-ticket-remark/STRemarkForm";
import { STRemarkEditForm } from "../support-ticket-remark/STRemarkEditForm";
import { STRemarkRowActions } from "../st-remark-row-actions/STRemarkRowActions";
import { STDetailsSideComponent } from "./STDetailsSideComponent";

export const SupportTicketDetailsPage = () => {
  useDocumentTitle("Support Ticket Details");

  // Get support ticket id from url params
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Fetch support ticket data
  const { data, refetch } = useFetchSupportTicket(id);

  // Set support ticket data and remark count
  const [STData, setSTData] = useState<SupportTicketsTableDto | null>(
    data?.data ?? null,
  );
  const [remarkCount, setRemarkCount] = useState<number>(0);

  // Update support ticket data when data changes
  useEffect(() => {
    if (data?.data) {
      setSTData(data.data);
      setRemarkCount(data.data.remarkCount ?? 0); // Track remark count
    }
  }, [data]);

  // Re-render component when remarkCount changes
  useEffect(() => {
    refetch();
  }, [remarkCount]);

  // State to store the id of the comment being edited
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Handler to cancel editing
  const handleCancel = () => {
    setEditingCommentId(null);
  };

  // Handler for submitting the form (create/update comment)
  const handleFormSubmit = async () => {
    await refetch();
    setEditingCommentId(null); // Reset editing state
  };

  return (
    <>
      {STData ? (
        <div className="flex h-screen px-[3%] py-[3%]">
          <div key={STData.id} className="m-8 flex w-full flex-col items-start">
            <div>
              <span className="text-2xl">{STData.subject}</span>{" "}
              <span className="font-light">{`(${STData.ticketNumber})`}</span>
            </div>
            <div className="my-4 text-sm text-gray-500">
              <span className="mr-2 rounded-2xl border px-4 py-2">
                {STData.status}
              </span>
              <span>
                Ticket opened{" "}
                {formatDistanceToNow(STData.createdOn ?? new Date(), {
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
              <div className="p-2 text-base font-light">
                {STData.description}
              </div>
            </div>
            {remarkCount > 0 && (
              <div className="my-6">
                <div>
                  <p className="p-2">Comments</p>
                </div>
                <Separator />
                <div className="p-2 text-base font-light">
                  {STData.supportTicketRemarks?.map((remark) => (
                    <div
                      key={remark.id}
                      className="relative my-4 rounded-md border p-2"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {remark.userFullName} commented{" "}
                          {formatDistanceToNow(remark.createdOn ?? new Date(), {
                            addSuffix: true,
                          })}
                        </p>
                        <STRemarkRowActions
                          rowId={remark.id}
                          setEditingCommentId={setEditingCommentId}
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
                        <p className="text-base font-light">{remark.message}</p>
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
            />
          </div>
          <div>
            <STDetailsSideComponent />
          </div>
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
