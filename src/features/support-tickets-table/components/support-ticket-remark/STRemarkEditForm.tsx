import { Form } from "@/react-toolkit/ui/form/Form";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { z } from "zod";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useDefineSTRemarkEditForm } from "../../hooks/useDefineSTRemarkEditForm";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";
import { descriptionProps } from "../../constants/st-remark-form-field-props";

interface STRemarkFormEditProps {
  id: string;
  refetch: () => Promise<void>;
  initialContent?: string;
  onCancel?: () => void;
}

export const STRemarkEditForm = ({
  id,
  refetch,
  initialContent = "",
  onCancel,
}: STRemarkFormEditProps) => {
  const {
    form,
    isDirty,
    remarksQueryKey,
    selectedRemarkId,
    rowId,
    refineFormData,
  } = useDefineSTRemarkEditForm();

  console.log("remarkEditForm", form);
  console.log("selectedRemarkId", selectedRemarkId);
  console.log("RowId", rowId);

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
    console.log("Form data before submission: ", form.getValues());

    const refinedData = refineFormData(formData);
    console.log("Refined form data: ", refinedData);

    await mutateSupportTicketRemark({
      id: selectedRemarkId ?? "",
      payload: refinedData as unknown as SupportTicketRemarksDto,
      crudAction: "update",
    });

    form.reset();
    await refetch();
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
        placeholder={"Edit your comment"}
        editorContentClassName="p-5"
        editorClassName="focus:outline-none"
        value={initialContent}
      />
      <div className="!mt-5 flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {"Save changes"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="destructive"
          className="min-w-[5rem]"
        >
          Cancel
        </Button>
      </div>
    </Form>
  );
};
