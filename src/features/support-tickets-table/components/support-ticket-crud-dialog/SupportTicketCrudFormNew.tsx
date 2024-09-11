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

export const SupportTicketCrudFormNew = () => {
  const { form, isDirty, remarksQueryKey, crudAction, rowId, refineFormData } =
    useDefineSTRemarkForm();

  // Get support ticket id from URL params
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Fetch support ticket data
  const { data, isFetching, isLoading, refetch } = useFetchSupportTicket(id);

  // Initialize states
  const [remarks, setRemarks] = useState<SupportTicketRemarksDto[]>([]);
  const [remarkCount, setRemarkCount] = useState<number>(0);

  const { subject, ticketNumber, status, createdOn, description } =
    data?.data ?? {};

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >([rowId], supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  const handleCancel = () => setEditingCommentId(null);

  const handleDeleteRemark = (deletedRemarkId: string) => {
    setRemarks(remarks.filter((remark) => remark.id !== deletedRemarkId));
    setRemarkCount(remarkCount - 1);
    console.log("Calling refetch after delete...");
    refetch();
    console.log("Data refetched successfully after delete");
  };

  const onSubmit = async (
    formData: z.infer<typeof supportTicketRemarksZodSchema>,
  ) => {
    console.log(formData);

    formData.id = editingCommentId ?? id;

    await mutateSupportTicketRemark({
      payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
      crudAction: crudAction,
    });

    console.log("Calling refetch after form submission...");
    refetch();
    form.reset();
    setEditingCommentId(null);
  };

  // Update remarks and remarkCount when data changes
  useEffect(() => {
    console.log("refetching data...");
    refetch();
    if (data?.data) {
      setRemarks(data.data.supportTicketRemarks ?? []);
      setRemarkCount(data.data.remarkCount ?? 0);
    }
  }, [data, remarkCount, refetch]);

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
        {remarkCount > 0 ? (
          <div className="my-6 w-full">
            <div>
              <p className="p-2">Comments</p>
            </div>
            <Separator />
            <div className="w-full p-2">
              {remarks.map((remark) => (
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
                    <STRemarkRowActionsNew
                      rowId={remark.id}
                      setEditingCommentId={setEditingCommentId}
                      onDelete={() => handleDeleteRemark(remark.id)}
                      onEdit={refetch}
                    />
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
                      />
                      <div className="!mt-5 flex justify-end space-x-2">
                        <Button
                          onClick={refetch}
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
        />
        <div className="!mt-5 flex w-full justify-end gap-2">
          <STStatusUpdateAction
            ticketId={data?.data.id}
            ticketNumber={data?.data.ticketNumber}
            currentStatus={data?.data.status}
            onUpdate={refetch}
          />
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
