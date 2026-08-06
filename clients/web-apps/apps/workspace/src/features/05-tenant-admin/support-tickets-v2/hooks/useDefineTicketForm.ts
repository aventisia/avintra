import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { createTicketZodSchema } from "../constants/ticket-zod-schema";
import { DATA_QUERY_KEY } from "../constants";
import { TicketTableDto } from "../dtos/TicketDto";

interface UseDefineTicketFormOptions {
  rowId: string;
  crudAction: CrudActionType;
  queryKey?: string[];
}

export const useDefineTicketForm = ({ rowId, crudAction, queryKey = DATA_QUERY_KEY }: UseDefineTicketFormOptions) => {
  const { setIsDirty } = useCrudDialogDirty();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createTicketZodSchema>>({
    resolver: zodResolver(createTicketZodSchema),
    defaultValues: {
      requestType: "ServiceRequest",
      title: "",
      description: "",
      requiredBy: "",
      agentRefId: "",
      changeSummary: "",
      changeReason: "",
      expectedBehavior: "",
      requestedTimeline: "",
      isDisabled: false,
    },
  });

  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    // The list endpoint returns the table projection, which carries every
    // field the create/update/view modal needs.
    const ticketsData = queryClient.getQueryData<{ data: TicketTableDto[] }>(queryKey);
    const ticketData = ticketsData?.data.find((item) => item.id === rowId);

    // Date inputs require YYYY-MM-DD, so strip the time portion of ISO values.
    const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

    form.reset({
      requestType: (ticketData?.requestType as "ServiceRequest" | "ChangeRequest") || "ServiceRequest",
      title: ticketData?.title ?? "",
      description: ticketData?.description ?? "",
      requiredBy: toDateInputValue(ticketData?.requiredBy),
      agentRefId: ticketData?.agentRefId ?? "",
      changeSummary: ticketData?.changeSummary ?? "",
      changeReason: ticketData?.changeReason ?? "",
      expectedBehavior: ticketData?.expectedBehavior ?? "",
      requestedTimeline: toDateInputValue(ticketData?.requestedTimeline),
      isDisabled: ticketData?.isDisabled ?? false,
    });
  }, [rowId, form, queryClient, queryKey]);

  const refineFormData = (formData: z.infer<typeof createTicketZodSchema>) => {
    return {
      ...formData,
      id: crudAction === "update" ? rowId : undefined,
      tenantId: userSession?.tenantId,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
      agentRefId: formData.agentRefId || undefined,
      requiredBy: formData.requiredBy || undefined,
      requestedTimeline: formData.requestedTimeline || undefined,
      isDisabled: formData.isDisabled ?? false,
    };
  };

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  return {
    form,
    isDirty,
    crudAction,
    refineFormData,
  };
};
