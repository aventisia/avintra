/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setVariableZodSchema } from "../constants/set-variable-zod-schema";
import { useEffect } from "react";

interface useSetVariableFormProps {
  /** Form fields values mainly getting as response from an api and to fill the form to view or update data */
  formFieldValuesToFill?: any;
}

export const useSetVariableForm = ({
  formFieldValuesToFill,
}: useSetVariableFormProps) => {
  const form = useForm<z.infer<typeof setVariableZodSchema>>({
    resolver: zodResolver(setVariableZodSchema),
    defaultValues: {
      variable: "",
      value: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    if (
      formFieldValuesToFill &&
      Object.keys(formFieldValuesToFill).length > 0
    ) {
      form.reset(formFieldValuesToFill);
    }
  }, [formFieldValuesToFill, form]);

  return {
    form,
    isSubmitting,
    isDirty,
  };
};
