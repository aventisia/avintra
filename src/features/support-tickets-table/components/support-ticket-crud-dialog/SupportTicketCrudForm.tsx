import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { z } from "zod";
import {
  descriptionProps,
  subjectProps,
} from "../../constants/support-ticket-form-field-props";
import { supportTicketZodSchema } from "../../constants/support-ticket-zod-schema";
import { SupportTicketsTableDto } from "../../dtos/SupportTicketsTableDto";
import { useDefineSupportTicketForm } from "../../hooks/useDefineSupportTicketForm";
import { supportTicketsOptimisticMutationFn } from "../../apis/suport-tickets-table-apis";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { DATA_QUERY_KEY } from "../../constants/constants";
import { useEffect } from "react";
import { RichTextAreaField } from "../minimal-tiptap/RichTextAreaField";

export const SupportTicketCrudForm = () => {
  const { form, rowId, isDirty, crudAction, refineFormData } =
    useDefineSupportTicketForm();

  // Define optimistic mutation to crete the support ticket
  const { mutate: mutateSupportTicket } = useListOptimisticMutation<
    SupportTicketsTableDto,
    SupportTicketsTableDto | boolean,
    SupportTicketsTableDto
  >(supportTicketsOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof supportTicketZodSchema>) => {
    // Perform the mutation
    mutateSupportTicket({
      id: rowId,
      payload: refineFormData(formData) as unknown as SupportTicketsTableDto,
      crudAction: crudAction,
    });

    //reset form
    form.reset();
  };

  // reset form every time the component is re-rendered
  useEffect(() => {
    form.reset();
    console.log("form reset");
  }, [form]);

  const isReadMode = crudAction === "read";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="h-screen px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Subject */}
      <InputField {...subjectProps} autoFocus={true} />

      {/* Description */}
      <RichTextAreaField
        {...descriptionProps}
        disabled={isReadMode}
        editorContentClassName="p-5"
        editorClassName="focus:outline-none"
      />

      {/* Submit button */}
      <div className="!mt-5 flex w-full justify-end">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {crudAction === "create" ? "Create support ticket" : "Save changes"}
        </Button>
      </div>
    </Form>
  );
};
