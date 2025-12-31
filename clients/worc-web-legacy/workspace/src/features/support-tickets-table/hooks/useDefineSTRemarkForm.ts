import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { supportTicketRemarksZodSchema } from "../constants/support-ticket-zod-schema";
import { SupportTicketRemarksDto } from "../dtos/SupportTicketRemarksDto";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";

/**
 * Custom hook for defining a support ticket remark form.
 */
export const useDefineSTRemarkForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    toggleFormDirty,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Get selected support ticket id from url params
  const location = useLocation();
  const selectedSupportTicketId =
    new URLSearchParams(location.search).get("st") ?? "";

  // Get store data of support ticket
  const { remarksQueryKey } = useSupportTicketsTableStore(
    useShallow((state) => ({
      remarksQueryKey: state.remarksQueryKey,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof supportTicketRemarksZodSchema>>({
    resolver: zodResolver(supportTicketRemarksZodSchema),
    defaultValues: {
      id: rowId ?? "",
      supportTicketId: selectedSupportTicketId ?? "",
      ticketNumber: "",
      message: "",
      userId: userSession?.tenantId ?? "",
      userFullName: userSession?.firstName + " " + userSession?.lastName,
      userName: userSession?.email ?? "",
      avatarSrc: userSession?.avatarSrc ?? "",
      initials: userSession?.userInitials ?? "",
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      isEdited: false,
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Desctructure form's methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch support ticket remarks data when crud action is update
  useEffect(() => {
    if (crudAction === "update" && rowId) {
      // Get support ticket remarks data from query client
      const stRemarksData = queryClient.getQueryData<{
        data: SupportTicketRemarksDto[];
      }>(remarksQueryKey);

      // Get remark data by id
      if (stRemarksData) {
        const remark = stRemarksData?.data.find((item) => item.id === rowId);
        if (remark) {
          form.reset({
            id: remark?.id ?? "",
            supportTicketId: remark?.supportTicketId ?? "",
            ticketNumber: remark?.ticketNumber ?? "",
            message: remark?.message ?? "",
            userFullName: remark?.userFullName ?? "",
            userName: remark?.userName ?? "",
            avatarSrc: remark?.avatarSrc ?? "",
            initials: remark?.initials ?? "",
            createdBy:
              remark?.createdBy ??
              userSession?.firstName + " " + userSession?.lastName,
            createdOn: remark?.createdOn
              ? new Date(remark?.createdOn)
              : new Date(),
            lastModifiedBy:
              remark?.lastModifiedBy ??
              userSession?.firstName + " " + userSession?.lastName,
            lastModifiedOn: remark?.lastModifiedOn
              ? new Date(remark?.lastModifiedOn)
              : new Date(),
          });
        }
      }
    }
  }, [crudAction, rowId, form, queryClient, remarksQueryKey, userSession]);

  const refineFormData = (
    formData: z.infer<typeof supportTicketRemarksZodSchema>,
  ) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    remarksQueryKey,
    rowId,
    crudAction,
    refineFormData,
  };
};
