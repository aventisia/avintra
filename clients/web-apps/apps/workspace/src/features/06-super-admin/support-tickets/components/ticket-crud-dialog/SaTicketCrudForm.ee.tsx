import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { getPublishedAgents } from "@/features/03-orchestrator/agents-table/apis/agents-table-apis";
import {
  agentRefIdProps,
  changeReasonProps,
  changeSummaryProps,
  descriptionProps,
  expectedBehaviorProps,
  idProps,
  isDisabledProps,
  requestTypeProps,
  requestedTimelineProps,
  requiredByProps,
  titleProps,
} from "@/features/05-tenant-admin/support-tickets-v2/constants/ticket-form-field-props";
import { createTicketZodSchema } from "@/features/05-tenant-admin/support-tickets-v2/constants/ticket-zod-schema";
import {
  TicketDto,
  TicketTableDto,
} from "@/features/05-tenant-admin/support-tickets-v2/dtos/TicketDto";
import { useDefineTicketForm } from "@/features/05-tenant-admin/support-tickets-v2/hooks/useDefineTicketForm";

import { saTicketOptimisticMutationFn } from "../../apis/sa-ticket-apis.ee";
import { DATA_QUERY_KEY } from "../../constants";

interface SaTicketCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const SaTicketCrudForm = ({ rowId, crudAction }: SaTicketCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { form, isDirty, refineFormData } = useDefineTicketForm({
    rowId,
    crudAction,
    queryKey: DATA_QUERY_KEY,
  });

  const { data: agentsData } = useQuery({
    queryKey: ["published-agents"],
    queryFn: getPublishedAgents,
  });

  const agentOptions =
    agentsData?.data?.map((a) => ({
      value: a.id,
      label: a.name ?? a.id,
    })) ?? [];

  const { mutate: mutateTicket, isPending } = useListOptimisticMutation<
    TicketTableDto,
    TicketDto | boolean | number,
    TicketTableDto
  >([rowId], saTicketOptimisticMutationFn, DATA_QUERY_KEY);

  const onSubmit = (formData: z.infer<typeof createTicketZodSchema>) => {
    if (isPending) return;
    mutateTicket(
      {
        payload: refineFormData(formData) as unknown as TicketTableDto,
        crudAction,
      },
      {
        onSuccess: (res) => {
          if (res.data) onCloseConfirmed();
        },
      },
    );
  };

  const isReadMode = crudAction === "read";
  const requestType = form.watch("requestType");

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {isReadMode && <InputField {...idProps} />}
      {crudAction === "create" ? (
        <SelectField {...requestTypeProps} />
      ) : (
        <SelectField {...requestTypeProps} disabled={isReadMode} />
      )}
      <InputField {...titleProps} autoFocus={crudAction === "create"} />
      <TextareaField {...descriptionProps} />
      {requestType === "ServiceRequest" && <InputField {...requiredByProps} />}
      {requestType === "ChangeRequest" && (
        <>
          <SelectField {...agentRefIdProps} selectOptions={agentOptions} />
          <TextareaField {...changeSummaryProps} />
          <TextareaField {...changeReasonProps} />
          <TextareaField {...expectedBehaviorProps} />
          <InputField {...requestedTimelineProps} />
        </>
      )}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty || isPending} className="min-w-[5rem]">
            {crudAction === "create" ? "Create Ticket" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
