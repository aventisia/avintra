import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import { Form } from "@avplatform/ui/form";
import { SelectField } from "@avplatform/ui/form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { COUNTRY_LS_KEY, INDIVIDUAL_ORGANIZATION_NAME } from "@/constants/variables";
import { countryProps } from "@/features/on-boarding/constants/company-form-field-props";
import { userInfoSchema } from "@/features/on-boarding/constants/user-info-zod-schema";
import { useDefineUserInfoForm } from "@/features/on-boarding/hooks/useDefineUserInfoForm";
import { useUpdateTenantInfoMutation } from "@/features/on-boarding/hooks/useUpdateTenantInfoMutation";
import { useCompanyInfoStore } from "@/features/on-boarding/stores/company-info-store";
import { useOnboardingStore } from "@/features/on-boarding/stores/on-boarding-store";

/**
 * Component for the create account form.
 */
export const UserInfoForm = () => {
  const { setOnBoardingStep } = useOnboardingStore(
    useShallow((state) => ({
      onBoardingStep: state.onBoardingStep,
      setOnBoardingStep: state.setOnBoardingStep,
    })),
  );
  // Define form
  const { form, isSubmitting } = useDefineUserInfoForm();

  const { setStepNo } = useCompanyInfoStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  const { updateTenantInfoMutation, isCreationPending } = useUpdateTenantInfoMutation();

  // Define submit handler
  const onSubmit = async (formData: z.infer<typeof userInfoSchema>) => {
    try {
      await updateTenantInfoMutation({
        domain: localStorage.getItem(USER_NAME_LS_KEY)?.split("@")[1] ?? "",
        organizationName: INDIVIDUAL_ORGANIZATION_NAME,
        type: "Individual",
        ...formData,
      });
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
      {/* Country */}
      <SelectField {...countryProps} />

      <div className="flex w-full justify-between">
        <Button
          size="lg"
          variant={"outline"}
          type="button"
          onClick={() => {
            setStepNo(1);
          }}
        >
          Back
        </Button>
        <SubmitButton size="lg" isPending={isCreationPending} primaryText="Continue" />
      </div>
    </Form>
  );
};
