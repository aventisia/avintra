import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { companyDetailsZodSchema } from "../constants/company-details-zod-schema";
import { useCompanyDetailsDialogStore } from "../store/company-details/company-details-dialog-store";

export const useCompanyDetailsForm = () => {
  const { toggleFormDirty } = useCompanyDetailsDialogStore(
    useShallow((state) => ({
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  const form = useForm<z.infer<typeof companyDetailsZodSchema>>({
    resolver: zodResolver(companyDetailsZodSchema),
    defaultValues: {
      address1: "",
      address2: "",
      billingEmail: "",
      city: "",
      companyName: "",
      country: "",
      gstNumber: "",
      pinCode: "",
      state: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return {
    form,
    isSubmitting,
    isDirty,
    control,
  };
};
