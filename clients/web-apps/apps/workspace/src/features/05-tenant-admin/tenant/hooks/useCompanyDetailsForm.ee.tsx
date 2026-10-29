import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateCompanyDetails } from "../apis/tenant-info-apis.ee";
import { companyDetailsZodSchema } from "../constants/company-details-zod-schema.ee";
import { useCompanyDetailsDialogStore } from "../store/company-details/company-details-dialog-store.ee";
import { useFetchCompanyDetails } from "./useFetchCompanyDetails.ee";

export const useCompanyDetailsForm = () => {
  const { toggleFormDirty, setOpen } = useCompanyDetailsDialogStore(
    useShallow((state) => ({
      toggleFormDirty: state.toggleFormDirty,
      setOpen: state.setOpen,
    })),
  );

  const queryClient = useQueryClient();

  const { data, isLoading } = useFetchCompanyDetails();

  const form = useForm<z.infer<typeof companyDetailsZodSchema>>({
    resolver: zodResolver(companyDetailsZodSchema),
    defaultValues: {
      id: "",
      organizationName: "",
      billingEmail: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      state: "",
      country: "",
      isWillingToFileGst: false,
      gstNumber: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
    reset,
  } = form;

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Set form values when data is fetched
  useEffect(() => {
    if (data) {
      reset({
        id: data?.data?.id ?? "",
        contactPerson: data?.data?.contactPerson ?? "",
        organizationName: data?.data?.organizationName ?? "",
        billingEmail: data?.data?.billingEmail ?? "",
        addressLine1: data?.data?.addressLine1 ?? "",
        addressLine2: data?.data?.addressLine2 ?? "",
        city: data?.data?.city ?? "",
        postalCode: data?.data?.postalCode ?? "",
        state: data?.data?.state ?? "",
        country: data?.data?.country ?? "",
        isWillingToFileGst: data?.data?.isWillingToFileGst ?? false,
        gstNumber: data?.data?.gstNumber ?? "",
      });
    }
  }, [data, reset]);

  // Handle form submission
  const { mutate, isPending } = useMutation({
    mutationFn: updateCompanyDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["COMPANY_DETAILS"] });
      setOpen(false);
      toast.success("Details updated successfully.");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return {
    form,
    isSubmitting,
    isDirty,
    control,
    isLoading,
    mutate,
    isPending,
  };
};
