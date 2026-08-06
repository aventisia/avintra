import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { Button } from "@avplatform/ui/buttons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TicketDto } from "../../dtos/TicketDto";
import { triageZodSchema } from "../../constants/ticket-zod-schema";
import { COMPLEXITY_OPTIONS, RISK_OPTIONS, TICKET_STATUSES } from "../../constants/constants";
import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";

type TriageFormData = z.infer<typeof triageZodSchema>;

interface TriagePanelProps {
  ticket: TicketDto;
  api: TicketDetailApiAdapter;
}

export const TriagePanel = ({ ticket, api }: TriagePanelProps) => {
  const queryClient = useQueryClient();

  const form = useForm<TriageFormData>({
    resolver: zodResolver(triageZodSchema),
    defaultValues: {
      status: ticket.status || undefined,
      complexity: ticket.complexity || undefined,
      estimatedEffortHours: ticket.estimatedEffortHours || undefined,
      estimatedCompletionDate: ticket.estimatedCompletionDate || undefined,
      isBillable: ticket.isBillable || false,
      requiresCustomerApproval: ticket.requiresCustomerApproval || false,
      riskLevel: ticket.riskLevel || undefined,
      dependencies: ticket.dependencies || "",
      triageRemarks: ticket.triageRemarks || "",
    },
  });

  const invalidateTicket = () => {
    queryClient.invalidateQueries({ queryKey: ["support-ticket-v2", ticket.id] });
    queryClient.invalidateQueries({ queryKey: ["sa-support-ticket", ticket.id] });
    queryClient.invalidateQueries({ queryKey: ["sa-support-tickets"] });
  };

  const mutation = useMutation({
    mutationFn: async (data: TriageFormData) => {
      const ticketId = ticket.id || "";
      const results = [];

      // Status acts as the disposition: update it when changed.
      if (data.status && data.status !== ticket.status) {
        results.push(await api.updateTicketStatus({ ticketId, status: data.status }));
      }

      results.push(await api.updateTicketTriage({ ...data, ticketId }));

      return results;
    },
    onSuccess: (res) => {
      if (res.length > 0 && res.every((r) => r.data)) {
        toast.success("Triage updated successfully");
        invalidateTicket();
      } else {
        toast.error(res.find((r) => !r.data)?.message || "Failed to update triage");
      }
    },
    onError: () => {
      toast.error("Failed to update triage");
    },
  });

  const onSubmit = (data: TriageFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Triage Panel</h2>
      <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            name="status"
            label="Disposition"
            selectOptions={TICKET_STATUSES.map((o) => ({ value: o.value, label: o.label }))}
          />
          <SelectField
            name="complexity"
            label="Complexity"
            selectOptions={COMPLEXITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <SelectField
            name="riskLevel"
            label="Risk Level"
            selectOptions={RISK_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <InputField
            name="estimatedEffortHours"
            label="Estimated Effort (hours)"
            type="number"
          />
          <InputField
            name="estimatedCompletionDate"
            label="Estimated Completion"
            type="date"
          />
          <div className="flex gap-4 items-end">
            <SwitchField name="isBillable" label="Billable" description="Mark as billable" />
            <SwitchField name="requiresCustomerApproval" label="Requires Approval" description="Requires customer approval" />
          </div>
        </div>
        <TextareaField
          name="dependencies"
          label="Dependencies"
          placeholder="List any dependencies (max 500 chars)"
        />
        <TextareaField
          name="triageRemarks"
          label="Remarks"
          placeholder="Triage remarks (max 1000 chars)"
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Triage"}
          </Button>
        </div>
      </Form>
    </div>
  );
};
