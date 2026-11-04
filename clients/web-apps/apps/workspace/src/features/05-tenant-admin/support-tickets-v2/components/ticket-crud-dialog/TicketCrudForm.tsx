import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { getPublishedAgents } from "@/features/03-orchestrator/agents-table/apis/agents-table-apis";

import { getCurrentTenantSupportConfig, ticketOptimisticMutationFn } from "../../apis/ticket-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  agentRefIdProps,
  changeReasonProps,
  changeSummaryProps,
  descriptionProps,
  expectedBehaviorProps,
  isDisabledProps,
  requestTypeProps,
  requestedTimelineProps,
  requiredByProps,
  titleProps,
} from "../../constants/ticket-form-field-props.constant";
import { createTicketZodSchema } from "../../constants/ticket-zod-schema";
import { TicketDto, TicketTableDto } from "../../dtos/TicketDto";
import { useDefineTicketForm } from "../../hooks/useDefineTicketForm";

interface TicketCrudFormProps {
  rowId: string;
  crudAction: "create" | "update";
}

export const TicketCrudForm = ({ rowId, crudAction }: TicketCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { form, isDirty, refineFormData } = useDefineTicketForm({ rowId, crudAction });

  const { data: agentsData } = useQuery({
    queryKey: ["published-agents"],
    queryFn: getPublishedAgents,
  });

  // Fetch the tenant's support configuration so the "Change Request" option is only
  // shown when the tenant has Change Requests enabled by the Super Admin.
  const { data: supportConfigData } = useQuery({
    queryKey: ["tenant-support-config"],
    queryFn: getCurrentTenantSupportConfig,
  });

  const isChangeRequestEnabled = supportConfigData?.data?.isChangeRequestEnabled ?? false;

  const agentOptions =
    agentsData?.data?.map((a) => ({
      value: a.id,
      label: a.name ?? a.id,
    })) ?? [];

  const { mutate: mutateTicket, isPending } = useListOptimisticMutation<
    TicketTableDto,
    TicketDto | boolean | number,
    TicketTableDto
  >([rowId], ticketOptimisticMutationFn, DATA_QUERY_KEY);

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

  const requestType = form.watch("requestType");

  const requestTypeOptions =
    isChangeRequestEnabled || requestType === "ChangeRequest"
      ? requestTypeProps.selectOptions
      : requestTypeProps.selectOptions.filter((option) => option.value !== "ChangeRequest");

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      recordName={form.watch("title") ?? ""}
    >
      <InputField {...titleProps} autoFocus={crudAction === "create"} />
      <TextareaField {...descriptionProps} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField {...requestTypeProps} selectOptions={requestTypeOptions} />
        {requestType === "ServiceRequest" && <InputField {...requiredByProps} />}
        {requestType === "ChangeRequest" && <InputField {...requestedTimelineProps} />}
      </div>
      {requestType === "ChangeRequest" && (
        <>
          <SelectField {...agentRefIdProps} selectOptions={agentOptions} />
          <TextareaField {...changeSummaryProps} />
          <TextareaField {...changeReasonProps} />
          <TextareaField {...expectedBehaviorProps} />
        </>
      )}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <SubmitButton
          primaryText={crudAction === "create" ? "Create ticket" : "Save changes"}
          secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty}
        />
      </CrudDialogActions>
    </Form>
  );
};
