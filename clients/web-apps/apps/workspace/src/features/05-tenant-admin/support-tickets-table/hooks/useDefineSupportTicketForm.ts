import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { DATA_QUERY_KEY } from "../constants/constants";
import { supportTicketZodSchema } from "../constants/support-ticket-zod-schema";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

/**
 * Custom hook for defining a support ticket form.
 */
export const useDefineSupportTicketForm = () => {
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
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof supportTicketZodSchema>>({
    resolver: zodResolver(supportTicketZodSchema),
    defaultValues: {
      id: "",
      ticketNumber: "",
      subject: "",
      description: "",
      priority: "",
      status: "",
      remarkCount: 0,
      isDisabled: false,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Desctructure form's methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch support ticket data when rowId changes
  useEffect(() => {
    // Get support tickets data from query client
    const supportTicketsData = queryClient.getQueryData<{
      data: SupportTicketsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get support ticket data by id
    const supportTicketData = supportTicketsData?.data.find((item) => item.id === rowId);

    // Set support ticket data to form
    form.reset({
      id: rowId,
      ticketNumber: supportTicketData?.ticketNumber ?? "",
      subject: supportTicketData?.subject ?? "",
      description: supportTicketData?.description ?? "",
      isDisabled: supportTicketData?.isDisabled ?? false,
      // Read (view) only fields
      priority: supportTicketData?.priority ?? "Low",
      status: supportTicketData?.status ?? "Open",
      remarkCount: supportTicketData?.remarkCount ?? 0,
      createdBy:
        supportTicketData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: supportTicketData?.createdOn ? new Date(supportTicketData?.createdOn) : new Date(),
      lastModifiedBy:
        supportTicketData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: supportTicketData?.lastModifiedOn
        ? new Date(supportTicketData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof supportTicketZodSchema>) => {
    console.log("Refining form data: ", formData);

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
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
