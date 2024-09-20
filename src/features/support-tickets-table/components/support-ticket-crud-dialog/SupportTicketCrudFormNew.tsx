import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { z } from "zod";
import { descriptionProps } from "../../constants/st-remark-form-field-props";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { useLocation } from "react-router-dom";
import { useFetchSupportTicket } from "../../hooks/useFetchSupportTicket";
import { formatDistanceToNow } from "date-fns";
import { DotSeparator } from "@/react-toolkit/ui/custom/DotSeparator";
import parse from "html-react-parser";
import { useState, useEffect } from "react";
import { Separator } from "@/react-toolkit/ui/separator";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { STRemarkRowActionsNew } from "../st-remark-row-actions/STRemarkRowActionsNew";
import { useDefineSTRemarkForm } from "../../hooks/useDefineSTRemarkForm";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { STDetailsSideComponent } from "../support-ticket-details/STDetailsSideComponent";
import { STStatusUpdateAction } from "./STStatusUpdateAction";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useShallow } from "zustand/react/shallow";
import { useSupportTicketsTableStore } from "../../stores/support-tickets-table-store";
import { useFetchSTRemarks } from "../../hooks/useFetchSTRemarks";

export const SupportTicketCrudFormNew = () => {
  const { form, isDirty, remarksQueryKey, crudAction, rowId, refineFormData } =
    useDefineSTRemarkForm();

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
  const { isSelectedSTDataChanged, setSupportTicketsState } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        isSelectedSTDataChanged: state.isSelectedSTDataChanged,
        setSupportTicketsState: state.setSupportTicketsState,
      })),
    );

  // Initialize states
  const [remarks, setRemarks] = useState<SupportTicketRemarksDto[]>(
    data?.data.supportTicketRemarks ?? [],
  );

  const { subject, ticketNumber, status, createdOn, description, remarkCount } =
    data?.data ?? {};

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const [editedRemark, setEditedRemark] = useState<string | null>("");

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

  const handleDeleteRemark = () => {
    setSupportTicketsState([], data?.data ?? null, true);
  };

  const onSubmit = (
    formData: z.infer<typeof supportTicketRemarksZodSchema>,
  ) => {
    const newRemark = {
      id: Date.now().toString(), // Temporary ID
      ...formData,
      userFullName: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
    };

    setRemarks((prevRemarks) => [newRemark, ...prevRemarks]);

    mutateSupportTicketRemark({
      payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
      crudAction: crudAction,
    });

    setSupportTicketsState([], data?.data ?? null, true);

    //refetch().then(() => console.log("Refetching data after submit..."));
    //refetchRemarks().then(() => console.log("Refetching all remarks after submit..."));
    form.reset();
    setEditingCommentId(null);
    setEditedRemark("");
  };

  useEffect(() => {
    refetchRemarks().then(() => console.log("Refetching all reamrks data..."));
    refetch().then(() => console.log("Refetching support ticket..."));
    setSupportTicketsState([], data?.data ?? null, false);
  }, [refetchRemarks, refetch, setSupportTicketsState, data?.data, isSelectedSTDataChanged]);

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
            Ticket opened{" "}
            {formatDistanceToNow(createdOn ?? new Date(), { addSuffix: true })}
          </span>
          <DotSeparator />
          <span>{remarkCount} comments</span>
        </div>
        <div className="my-8">
          <div>
            <p className="p-2">Message</p>
          </div>
          <div className="w-full p-2 text-base font-light">
            {parse(description ?? "")}
          </div>
        </div>
        {stRemarks && stRemarks.data.length > 0 ? (
          <div className="my-6 w-full">
            <div>
              <p className="p-2">Comments</p>
            </div>
            <Separator />
            <div className="w-full p-2">
              {stRemarks?.data.map((remark) => (
                <div
                  key={remark.id}
                  className="relative my-4 w-full rounded-md border p-2"
                >
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
                        <Button
                          onClick={refetch}
                          disabled={!isDirty}
                          className="min-w-[5rem]"
                        >
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
          {userSession?.userRoles.some((role) =>
            ["SA", "GA", "GSA"].includes(role),
          ) && (
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
