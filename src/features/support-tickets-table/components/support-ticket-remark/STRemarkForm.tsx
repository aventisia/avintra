import { Form } from "@/react-toolkit/ui/form/Form";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { z } from "zod";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useDefineSTRemarkForm } from "../../hooks/useDefineSTRemarkForm";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { descriptionProps } from "../../constants/st-remark-form-field-props";

interface STRemarkFormProps {
  id: string;
}

export const STRemarkForm = ({ id }: STRemarkFormProps) => {
  const { form, isDirty, remarksQueryKey, rowId, refineFormData } =
    useDefineSTRemarkForm();

  // Define optimistic mutation to create/update the support ticket remark
  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >(supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  // Define submit handler
  const onSubmit = async (
    formData: z.infer<typeof supportTicketRemarksZodSchema>,
  ) => {
    await mutateSupportTicketRemark({
      id: rowId ?? "",
      payload: refineFormData(formData) as unknown as SupportTicketRemarksDto,
      crudAction: "create",
    });

    form.reset();
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full px-2.5 pb-5"
      key={id}
    >
      <RichTextAreaField
        {...descriptionProps}
        placeholder={"Add a comment"}
        editorContentClassName="p-5"
        editorClassName="focus:outline-none"
      />
      <div className="!mt-5 flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {"Add Comment"}
        </Button>
      </div>
    </Form>
  );
};
