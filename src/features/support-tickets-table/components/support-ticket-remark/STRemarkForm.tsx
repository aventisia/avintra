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

/**
 * Props for STRemarkForm component.
 * @interface
 */
interface STRemarkFormProps {
  id: string;
  remarkCount: number;
  setRemarkCount: (count: number) => void;
}

/**
 * STRemarkForm component.
 * @param {STRemarkFormProps} props - Component props.
 * @returns {JSX.Element} - Rendered component.
 */
export const STRemarkForm = ({
  id,
  remarkCount,
  setRemarkCount,
}: STRemarkFormProps) => {
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

    // Increase remark count
    setRemarkCount(remarkCount + 1);

    // Reset form
    await form.reset();
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full px-2.5 pb-5"
      key={id}
    >
      {/* Rich text area field to add comment */}
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
      {/* Submit button */}
      <div className="!mt-5 flex justify-end space-x-2">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {"Add Comment"}
        </Button>
      </div>
    </Form>
  );
};
