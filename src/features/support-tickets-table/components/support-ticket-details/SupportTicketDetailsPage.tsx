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
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { useDefineSTRemarkForm } from "../../hooks/useDefineSTRemarkForm";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { REMARKS_QUERY_KEY } from "../../constants/constants";
import { z } from "zod";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { STRemarkRowActions } from "../st-remark-row-actions/STRemarkRowActions";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { descriptionProps } from "../../constants/st-remark-form-field-props";

export const SupportTicketDetailsPage = () => {
  useDocumentTitle("Support Ticket Details");

  const { form, isDirty, refineFormData } = useDefineSTRemarkForm();

  // Define optimistic mutation to update the support ticket remark
  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >(supportTicketRemarksOptimisticMutationFn, [REMARKS_QUERY_KEY]);

  const location = useLocation();
  const id = new URLSearchParams(location.search).get("st") ?? "";

  const { data, refetch } = useFetchSupportTicket(id);
  const [STData, setSTData] = useState<SupportTicketsTableDto | null>(
    data?.data ?? null,
  );

  useEffect(() => {
    setSTData(data?.data ?? null);
  }, [data]);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (editingCommentId && STData) {
      const remark = STData.supportTicketRemarks?.find(
        (r) => r.id === editingCommentId,
      );
      if (remark) {
        form.reset({ message: remark.message });
      }
    }
  }, [editingCommentId, STData, form]);

  const onSubmit = (
    formData: z.infer<typeof supportTicketRemarksZodSchema>,
  ) => {
    if (editingCommentId) {
      console.log(formData);

      // Update the support ticket remark
      mutateSupportTicketRemark({
        id: editingCommentId,
        payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
        crudAction: "update",
      });

      // Refetch the support ticket data
      refetch();
      setEditingCommentId(null);
    }
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    form.reset({ message: "" });
  };

  return (
    <>
      {STData ? (
        <div key={STData.id} className="m-8 flex w-[60%] flex-col items-start">
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
            <span>{STData.remarkCount} comments</span>
          </div>
          <Separator />
          <div className="my-8">
            <div>
              <p className="p-2">Message</p>
            </div>
            <Separator />
            <div className="p-2 text-base font-light">{STData.description}</div>
          </div>
          {(STData.remarkCount ?? 0) > 0 && (
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
                      <Form
                        methods={form}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full px-2.5 pb-5"
                      >
                        <RichTextAreaField
                          {...descriptionProps}
                          placeholder="Edit your comment"
                          editorContentClassName="p-5"
                          editorClassName="focus:outline-none"
                        />
                        <div className="!mt-5 flex justify-end space-x-2">
                          <Button
                            type="submit"
                            disabled={!isDirty}
                            className="min-w-[5rem]"
                          >
                            Update Comment
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelEdit}
                            variant="destructive"
                            className="min-w-[5rem]"
                          >
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <p className="text-base font-light">{remark.message}</p>
                    )}
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}
          <STRemarkForm ticketId={id} refetch={async () => await refetch()} />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
