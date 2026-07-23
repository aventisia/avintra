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
import { useFetchSTRemarks } from "../../hooks/useFetchSTRemarks";
import { useFetchSupportTicket } from "../../hooks/useFetchSupportTicket";
import { useSupportTicketsTableStore } from "../../stores/support-tickets-table-store";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { STRemarkRowActionsNew } from "../st-remark-row-actions/STRemarkRowActionsNew";
import { STDetailsSideComponent } from "../support-ticket-details/STDetailsSideComponent";
import { STStatusUpdateAction } from "./STStatusUpdateAction";

export const SupportTicketCrudFormNew = () => {
  const { form, isDirty, crudAction, rowId, refineFormData } = useDefineSTRemarkForm();

  // Get support ticket id from URL params
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Fetch support ticket data
  const { data, isFetching, isLoading, refetch } = useFetchSupportTicket(id);

  // Fetch support ticket remarks
  const { data: stRemarks, refetch: refetchRemarks } = useFetchSTRemarks();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get store isSelectedSTDataChanged and setSupportTicketsState action
  const { setSupportTicketsState, isSelectedSTDataChanged, remarksQueryKey } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        setSupportTicketsState: state.setSupportTicketsState,
        isSelectedSTDataChanged: state.isSelectedSTDataChanged,
        remarksQueryKey: state.remarksQueryKey,
      })),
    );

  // Initialize states
  const [remarks, setRemarks] = useState<SupportTicketRemarksDto[]>(
    data?.data.supportTicketRemarks ?? [],
  );

  const { subject, ticketNumber, status, createdOn, description, remarkCount } = data?.data ?? {};

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedRemark, setEditedRemark] = useState<string | null>("");

  const queryClient = useQueryClient(); // Initialize QueryClient

  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >([rowId], supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  const handleCancel = () => setEditingCommentId(null);

  const handleEditRemark = () => {
    const newRemarks = remarks.map((remark) => {
      if (remark.id === editingCommentId) {
        return { ...remark, message: editedRemark ?? "" };
      }
      return remark;
    });
    setRemarks(newRemarks);
    refetchRemarks();
    refetch();
  };

  const handleDeleteRemark = async () => {
    setSupportTicketsState([], null, true);
    await refetchRemarks();
    // await refetch();
  };

  const onSubmit = async (formData: z.infer<typeof supportTicketRemarksZodSchema>) => {
    const newRemark = {
      id: Date.now().toString(),
      ...formData,
      userFullName: `${userSession?.firstName} ${userSession?.lastName}`,
      createdOn: new Date(),
    };

    setRemarks((prevRemarks) => [newRemark, ...prevRemarks]);

    await mutateSupportTicketRemark({
      payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
      crudAction: crudAction,
    });

    // Invalidate queries after submission
    queryClient.invalidateQueries({ queryKey: getTicketQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: remarksQueryKey });

    await Promise.all([refetch(), refetchRemarks()]);

    console.log("Refetched after submit");
    setSupportTicketsState([], null, true);

    form.reset();
    setEditingCommentId(null);
    setEditedRemark("");
  };

  useEffect(() => {
    if (isSelectedSTDataChanged) {
      Promise.all([refetch(), refetchRemarks()])
        .then(() => console.log("Refetched support ticket and remarks data..."))
        .catch((error) => console.error("Refetch error: ", error));
      queryClient.invalidateQueries({ queryKey: getTicketQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: remarksQueryKey });
      setSupportTicketsState([], null, false);
      console.log("ST data @ useEffect: ", data?.data);
    }
  }, [
    isSelectedSTDataChanged,
    refetch,
    refetchRemarks,
    setSupportTicketsState,
    data,
    id,
    queryClient,
    remarksQueryKey,
  ]);

  if (isLoading || isFetching) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="mb-16 flex px-[3%] py-[3%]">
      <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="">
        <div>
          <span className="text-2xl">{subject}</span>{" "}
          <span className="font-light">{`(${ticketNumber})`}</span>
        </div>
        <div className="my-4 text-sm text-gray-500">
          <span className="mr-2 rounded-2xl border px-4 py-2">{status}</span>
          <span>
            Ticket opened {formatDistanceToNow(createdOn ?? new Date(), { addSuffix: true })}
          </span>
          <DotSeparator />
          <span>{remarkCount} comments</span>
        </div>
        <div className="my-8">
          <div>
            <p className="p-2">Message</p>
          </div>
          <div className="w-full p-2 text-base font-light">{parse(description ?? "")}</div>
        </div>
        {stRemarks && stRemarks.data.length > 0 ? (
          <div className="my-6 w-full">
            <div>
              <p className="p-2">Comments</p>
            </div>
            <Separator />
            <div className="w-full p-2">
              {stRemarks?.data.map((remark) => (
                <div key={remark.id} className="relative my-4 w-full rounded-md border p-2">
                  <div className="mb-2 flex w-full items-center justify-between">
                    <p className="flex-1 text-sm text-gray-500">
                      {remark.userFullName} commented{" "}
                      {formatDistanceToNow(remark.createdOn ?? new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                    {userSession?.firstName + " " + userSession?.lastName ===
                      remark.userFullName && (
                      <STRemarkRowActionsNew
                        rowId={remark.id}
                        setEditingCommentId={setEditingCommentId}
                        onDelete={handleDeleteRemark}
                        onEdit={handleEditRemark}
                      />
                    )}
                  </div>
                  {editingCommentId === remark.id ? (
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
                        onBlur={(value) => console.log(value)}
                      />
                      <div className="!mt-5 flex justify-end space-x-2">
                        <Button onClick={refetch} disabled={!isDirty} className="min-w-[5rem]">
                          Save changes
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
                    <div className="w-full">{parse(remark.message ?? "")}</div>
                  )}
                </div>
              ))}
            </div>
            <Separator />
          </div>
        ) : null}
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
          onBlur={(value) => console.log(value)}
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
