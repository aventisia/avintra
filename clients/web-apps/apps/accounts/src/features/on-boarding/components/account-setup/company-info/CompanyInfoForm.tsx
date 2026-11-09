import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { InputField, SelectField } from "@avplatform/ui/form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { COUNTRY_LS_KEY } from "@/constants/variables";
import {
  countryProps,
  industryProps,
  numberOfEmployeesProps,
  organizationDomainProps,
  organizationNameProps,
  roleProps,
} from "@/features/on-boarding/constants/company-form-field-props";
import { companyInfoSchema } from "@/features/on-boarding/constants/company-info-zod-schema";
import { useDefineCompanyInfoForm } from "@/features/on-boarding/hooks/useDefineCompanyInfoForm";
import { useUpdateTenantInfoMutation } from "@/features/on-boarding/hooks/useUpdateTenantInfoMutation";
import { useCompanyInfoStore } from "@/features/on-boarding/stores/company-info-store";
import { useOnboardingStore } from "@/features/on-boarding/stores/on-boarding-store";

/**
 * Component for the create account form.
 */
export const CompanyInfoForm = () => {
  const { setOnBoardingStep } = useOnboardingStore(
    useShallow((state) => ({
      onBoardingStep: state.onBoardingStep,
      setOnBoardingStep: state.setOnBoardingStep,
    })),
  );
  // Define form
  const { form, isSubmitting } = useDefineCompanyInfoForm();

  const { setStepNo } = useCompanyInfoStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  const { updateTenantInfoMutation, isCreationPending } = useUpdateTenantInfoMutation();

  // Define submit handler
  const onSubmit = async (formData: z.infer<typeof companyInfoSchema>) => {
    try {
      await updateTenantInfoMutation({ ...formData, type: "Organization" });
      localStorage.setItem(COUNTRY_LS_KEY, formData.country);

      // Reset the form to clear dirty state and suppress discard dialog
      form.reset(form.getValues());

      setTimeout(() => {
        setOnBoardingStep("choose-plan");
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
      <InputField autoFocus {...organizationNameProps} />

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
          type="button"
          onClick={() => {
            setStepNo(1);
          }}
        >
          Back
        </Button>
        <SubmitButton isPending={isCreationPending} primaryText="Continue" />
      </div>
    </Form>
  );
};
