import { Form } from "@/react-toolkit/ui/form/Form";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { REMARKS_QUERY_KEY } from "../../constants/constants";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { z } from "zod";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useDefineSTRemarkForm } from "../../hooks/useDefineSTRemarkForm";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { descriptionProps } from "../../constants/st-remark-form-field-props";

interface STRemarkFormProps {
  ticketId: string;
  refetch: () => Promise<void>;
}

export const STRemarkForm = ({ ticketId, refetch }: STRemarkFormProps) => {
  // Define support ticket remark form
  const { form, isDirty, crudAction, refineFormData } = useDefineSTRemarkForm();

  // Define optimistic mutation to crete the support ticket remark
  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >(supportTicketRemarksOptimisticMutationFn, [REMARKS_QUERY_KEY, ticketId]);

  // Define submit handler
  const onSubmit = async (
    formData: z.infer<typeof supportTicketRemarksZodSchema>,
  ) => {
    // Create the support ticket
    mutateSupportTicketRemark({
      id: ticketId,
      payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
      crudAction: crudAction,
    });

    // Reset the form
    form.reset();

    // Refetch the support ticket data to get updated information
    console.log("Refetching data...");
    await refetch();
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full px-2.5 pb-5"
    >
      <RichTextAreaField
        {...descriptionProps}
        editorContentClassName="p-5"
        editorClassName="focus:outline-none"
      />
      <div className="!mt-5 flex justify-end">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {crudAction === "create" ? "Add Comment" : "Save changes"}
        </Button>
      </div>
    </Form>
  );
};
