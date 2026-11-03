import { Button } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
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
  idProps,
  isDisabledProps,
  requestTypeProps,
  requestedTimelineProps,
  requiredByProps,
  titleProps,
} from "../../constants/ticket-form-field-props";
import { createTicketZodSchema } from "../../constants/ticket-zod-schema";
import { TicketDto, TicketTableDto } from "../../dtos/TicketDto";
import { useDefineTicketForm } from "../../hooks/useDefineTicketForm";

interface TicketCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
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

  const isReadMode = crudAction === "read";
  const requestType = form.watch("requestType");

  // Only include the "Change Request" option when the tenant has it enabled. When
  // viewing/editing an existing Change Request ticket, keep the option so the current
  // value still displays correctly even if the tenant has since disabled the feature.
  const requestTypeOptions =
    isChangeRequestEnabled || requestType === "ChangeRequest"
      ? requestTypeProps.selectOptions
      : requestTypeProps.selectOptions.filter((option) => option.value !== "ChangeRequest");

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {isReadMode && <InputField {...idProps} />}
      {crudAction === "create" ? (
        <SelectField {...requestTypeProps} selectOptions={requestTypeOptions} />
      ) : (
        <SelectField
          {...requestTypeProps}
          selectOptions={requestTypeOptions}
          disabled={isReadMode}
        />
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
        <CrudDialogActions>
          <Button type="submit" disabled={!isDirty || isPending} className="min-w-[5rem]">
            {crudAction === "create" ? "Create ticket" : "Save changes"}
          </Button>
        </CrudDialogActions>
      )}
    </Form>
  );
};
