import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { CompanyZodSchema } from "../types/company-zod-schema";
import { useCompanyFormStore } from "../stores/company-form-store";
import { useEffect } from "react";
import type { CompanyDto } from "../dtos/my-account-company-dto";


export const useMyAccountCompanyForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );


  // Get data-table crud dialog store state and actions
  const {
    crudAction,
    toggleFormDirty,
  } = useCompanyFormStore(
    useShallow((state) => ({
      crudAction: state.crudAction,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );


  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof CompanyZodSchema>>({
    resolver: zodResolver(CompanyZodSchema),
    defaultValues: {
      userId: "",
      companyType: "",
      companyName: "",
      role: "",
      addressLine1: "",
      addressLine2: "",
      country: "",
      stateOrProvince: "",
      city: "",
      ZipOrPostalCode: "",
    },
  });

  const { formState: { isDirty }, } = form;

  // Fetch flow data when rowId changes
  useEffect(() => {
    // Get flows data from query client
    const response = queryClient.getQueryData<{
      data: CompanyDto;
    }>(["userId"]);

    // Set flow data to form
    form.reset({
      userId: response?.data.userId,
      companyType: response?.data.companyType,
      companyName: response?.data.companyName,
      role: response?.data.role,
      addressLine1: response?.data.addressLine1,
      addressLine2: response?.data.addressLine2,
      country: response?.data.country,
      stateOrProvince: response?.data.stateOrProvince,
      city: response?.data.city,
      ZipOrPostalCode: response?.data.ZipOrPostalCode,
    });
  }, [form, queryClient, userSession]);



  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof CompanyZodSchema>) => {
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
    crudAction,
    isDirty,
    refineFormData,
  };
};
