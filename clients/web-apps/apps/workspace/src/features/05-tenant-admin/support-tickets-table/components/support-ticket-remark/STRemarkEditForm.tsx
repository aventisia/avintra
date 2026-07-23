import { Button } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { z } from "zod";

import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { descriptionProps } from "../../constants/st-remark-form-field-props";
import { supportTicketRemarksZodSchema } from "../../constants/support-ticket-zod-schema";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { useDefineSTRemarkEditForm } from "../../hooks/useDefineSTRemarkEditForm";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";

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
  const { form, isDirty, remarksQueryKey, rowId, refineFormData } = useDefineSTRemarkEditForm();

  // Define optimistic mutation to create/update the support ticket remark
  const { mutate: mutateSupportTicketRemark } = useListOptimisticMutation<
    SupportTicketRemarksDto,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >([rowId], supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  // Define submit handler
  const onSubmit = async (formData: z.infer<typeof supportTicketRemarksZodSchema>) => {
    console.log("Form data before submission: ", form.getValues());

    const refinedData = refineFormData(formData);
    console.log("Refined form data: ", refinedData);

    mutateSupportTicketRemark({
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
        throttleDelay={2000}
        className="w-full"
        editorContentClassName="p-5"
        autofocus={false}
        immediatelyRender={true}
        editable={true}
        injectCSS={true}
        editorClassName="focus:outline-none"
        disabled={false}
        value={initialContent}
      />
      <div className="!mt-5 flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {"Save changes"}
        </Button>
        <Button type="button" onClick={onCancel} variant="destructive" className="min-w-[5rem]">
          Cancel
        </Button>
      </div>
    </Form>
  );
};
