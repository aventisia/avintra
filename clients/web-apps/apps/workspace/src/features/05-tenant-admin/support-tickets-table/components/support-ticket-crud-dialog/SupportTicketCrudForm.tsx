import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { z } from "zod";

import { supportTicketsOptimisticMutationFn } from "../../apis/suport-tickets-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
import { descriptionProps, subjectProps } from "../../constants/support-ticket-form-field-props";
import { supportTicketZodSchema } from "../../constants/support-ticket-zod-schema";
import { SupportTicketsTableDto } from "../../dtos/SupportTicketsTableDto";
import { useDefineSupportTicketForm } from "../../hooks/useDefineSupportTicketForm";
import { RichTextAreaField } from "../richtextarea/RichTextAreaField";

interface SupportTicketCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const SupportTicketCrudForm = ({ rowId, crudAction }: SupportTicketCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { form, isDirty, refineFormData } = useDefineSupportTicketForm({ rowId, crudAction });

  // Define optimistic mutation to crete the support ticket
  const { mutate: mutateSupportTicket } = useListOptimisticMutation<
    SupportTicketsTableDto,
    SupportTicketsTableDto | boolean,
    SupportTicketsTableDto
  >([rowId], supportTicketsOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = async (formData: z.infer<typeof supportTicketZodSchema>) => {
    // Perform the mutation
    mutateSupportTicket({
      payload: refineFormData(formData) as unknown as SupportTicketsTableDto,
      crudAction: crudAction,
    });

    //reset form
    await form.reset();

    // Close the dialog
    onCloseConfirmed();
  };

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="h-screen px-2.5 pb-5">
      {/* Subject */}
      <InputField {...subjectProps} autoFocus={true} />

      {/* Description */}
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
      <div className="!mt-5 flex w-full justify-end">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          {crudAction === "create" ? "Create support ticket" : "Save changes"}
        </Button>
      </div>
    </Form>
  );
};
