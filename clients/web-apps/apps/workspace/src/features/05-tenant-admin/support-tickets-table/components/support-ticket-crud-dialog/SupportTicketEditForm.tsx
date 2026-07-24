import { DotSeparator, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Form } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { getTicketQueryKey } from "../../constants/constants";
import { descriptionProps } from "../../constants/st-remark-form-field-props";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { useDefineSTRemarkForm } from "../../hooks/useDefineSTRemarkForm";
import { useFetchSupportTicket } from "../../hooks/useFetchSupportTicket";
import { useSanitizer } from "../../hooks/useSanitizer";
import { useSupportTicketsTableStore } from "../../stores/support-tickets-table-store";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { STRemarkRowActionsNew } from "../st-remark-row-actions/STRemarkRowActionsNew";
import { STDetailsSideComponent } from "../support-ticket-details/STDetailsSideComponent";
import { STStatusUpdateAction } from "./STStatusUpdateAction";

export const SupportTicketEditForm = () => {
  // Get support ticket id from URL params
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Define support ticket edit form with support ticket remark form
  const { form, isDirty, remarksQueryKey, refineFormData } = useDefineSTRemarkForm({
    rowId: id,
    crudAction: "update",
  });

  const sanitizeHtml = useSanitizer();

  // // Get the query client for cache management
  const queryClient = useQueryClient();

  // Fetch support ticket data
  const { data, isFetching, isLoading, refetch } = useFetchSupportTicket(id);

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get store isSelectedSTDataChanged and setSupportTicketsState action
  const { setSupportTicketsState, isSelectedSTDataChanged } = useSupportTicketsTableStore(
    useShallow((state) => ({
      setSupportTicketsState: state.setSupportTicketsState,
      isSelectedSTDataChanged: state.isSelectedSTDataChanged,
    })),
  );

  // Initialize states storing remarks and reamrks count
  const [remarks, setRemarks] = useState<SupportTicketRemarksDto[]>([]);
  const [remarkCount, setRemarkCount] = useState<number>(0);

  // Destructuring fetched support ticket data
  const { subject, ticketNumber, status, createdOn, description } = data?.data ?? {};

  // State for tracking which comment is being edited
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Mutation hook for optimistic updates
  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >([id], supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  // function to handle cancel button click
  const handleCancel = () => setEditingCommentId(null);

  // function to handle update remark
  const handleEditRemark = () => {
    refetch().then(() => console.log("Refetching after editing..."));
  };

  // function to handle delete remark
  const handleDeleteRemark = async (deletedRemarkId: string) => {
    setRemarks(remarks.filter((remark) => remark.id !== deletedRemarkId));
    setRemarkCount(remarkCount - 1);
    // Invalidate query to refetch data after deletion
    queryClient.invalidateQueries({ queryKey: getTicketQueryKey(id) });
  };

  const onSubmit = async (formData: z.infer<typeof supportTicketRemarksZodSchema>) => {
    formData.id = editingCommentId ?? id;

    await mutateSupportTicketRemark({
      payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
      crudAction: "update",
    });

    await refetch();
    form.reset();
    setEditingCommentId(null);
    setSupportTicketsState([], null, true);
  };

  // Update remarks and remarkCount when data changes and refetch data
  useEffect(() => {
    if (isSelectedSTDataChanged) {
      refetch();
      setSupportTicketsState([], null, false);
    }
    if (data?.data) {
      setRemarks(data.data.supportTicketRemarks ?? []);
      setRemarkCount(data.data.remarkCount ?? 0);
    }
  }, [data, refetch, isSelectedSTDataChanged]);

  // Show loading skeleton while loading or fetching data
  if (isLoading || isFetching) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="mb-16 flex px-[3%] py-[3%]">
      <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="">
        {/* Title of the support ticket */}
        <div>
          <span className="text-2xl">{subject}</span>{" "}
          <span className="font-light">{`(${ticketNumber})`}</span>
        </div>
        {/* Sub-title of support ticket displaying status, created on and number of comments */}
        <div className="my-4 text-sm text-gray-500">
          <span className="mr-2 rounded-2xl border px-4 py-2">{status}</span>
          <span>
            Ticket opened {formatDistanceToNow(createdOn ?? new Date(), { addSuffix: true })}
          </span>
          <DotSeparator />
          <span>{remarkCount} comments</span>
        </div>
        {/* Description of support ticket */}
        <div className="my-8">
          <div>
            <p className="p-2">Message</p>
          </div>
          <div className="w-full p-2 text-base font-light">
            {parse(sanitizeHtml(description ?? ""))}
          </div>
        </div>
        {/* Remarks linked with the support ticket */}
        {remarkCount > 0 ? (
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
                    {/* Edit & delete action for support ticket remark */}
                    <STRemarkRowActionsNew
                      rowId={remark.id}
                      setEditingCommentId={setEditingCommentId}
                      onDelete={() => handleDeleteRemark(remark.id)}
                      onEdit={handleEditRemark}
                    />
                  </div>
                  {editingCommentId === remark.id ? (
                    // Edit support ticket remark
                    <>
                      <RichTextAreaField
                        {...descriptionProps}
                        throttleDelay={2000}
                        className="w-full"
                        editorContentClassName="p-5"
                        autofocus={false}
                        immediatelyRender={true}
                        editable={true}
                        injectCSS={true}
                        editorClassName="focus:outline-none"
                        disabled={false}
                        value={remark.message}
                      />
                      <div className="!mt-5 flex justify-end space-x-2">
                        <Button
                          onClick={handleEditRemark}
                          disabled={!isDirty}
                          className="min-w-[5rem]"
                        >
                          {"Save changes"}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="destructive"
                          className="min-w-[5rem]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full">{parse(sanitizeHtml(remark.message ?? ""))}</div>
                  )}
                </div>
              ))}
            </div>
            <Separator />
          </div>
        ) : null}
        {/* Add new remarks to support ticket */}
        <RichTextAreaField
          {...descriptionProps}
          throttleDelay={2000}
          className="w-full"
          editorContentClassName="p-5"
          autofocus={false}
          immediatelyRender={true}
          editable={true}
          injectCSS={true}
          editorClassName="focus:outline-none"
          disabled={false}
        />
        <div className="!mt-5 flex w-full justify-end gap-2">
          {userSession?.userRoles.some((role) => ["SA"].includes(role)) && (
            <STStatusUpdateAction
              ticketId={data?.data.id}
              ticketNumber={data?.data.ticketNumber}
              currentStatus={data?.data.status}
              onUpdate={refetch}
            />
          )}
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            Add Comment
          </Button>
        </div>
      </Form>
      <div className="w-[20%] px-2">
        <STDetailsSideComponent />
      </div>
    </div>
  );
};
