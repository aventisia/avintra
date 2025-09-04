import {
  countryProps,
  industryProps,
  numberOfEmployeesProps,
  organizationDomainProps,
  organizationNameProps,
  roleProps,
} from "@/features/sign-up/constants/company-form-field-props";
import { companyInfoSchema } from "@/features/sign-up/constants/company-info-zod-schema";
import { useDefineCompanyInfoForm } from "@/features/sign-up/hooks/useDefineCompanyInfoForm";
import { useUpdateTenantInfoMutation } from "@/features/sign-up/hooks/useUpdateTenantInfoMutation";
import { useCompanyInfoStore } from "@/features/sign-up/stores/company-info-store";
import { Form } from "@/react-toolkit/ui/form/Form";

import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { InputField, SelectField } from "@aventisia/ui/form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

/**
 * Component for the create account form.
 */
export const CompanyInfoForm = () => {
  // Get navigate
  const navigate = useNavigate();

  // Define form
  const { form, isSubmitting } = useDefineCompanyInfoForm();

  const { setStepNo } = useCompanyInfoStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  const { updateTenantInfoMutation, isCreationPending } =
    useUpdateTenantInfoMutation();

  // Define submit handler
  const onSubmit = async (formData: z.infer<typeof companyInfoSchema>) => {
    try {
      await updateTenantInfoMutation(formData);
      localStorage.setItem("country", formData.country);

      // Reset the form to clear dirty state and suppress discard dialog
      form.reset(form.getValues());

      setTimeout(() => {
        navigate("/choose-plan");
      }, 300);
    } catch (error) {
      // Optional: If you're not already handling error in useMutation
      console.error(error instanceof Error ? error.message : String(error));
    }
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting}
      className="space-y-4"
    >
      {/* Email */}
      <InputField {...organizationNameProps} />

      <InputField {...organizationDomainProps} />

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        <SelectField {...numberOfEmployeesProps} />

        {/* Confirm Password */}
        <SelectField {...countryProps} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        {/* Terms and Conditions */}
        <InputField {...industryProps} />

        {/* Confirm Password */}
        <InputField {...roleProps} />
      </div>

      <div className="flex w-full justify-between">
        <Button
          variant={"outline"}
          onClick={() => {
            setStepNo(1);
          }}
        >
          Back
        </Button>
        <SubmitButton isPending={isCreationPending} primaryText="Finish" />
      </div>
    </Form>
  );
};
