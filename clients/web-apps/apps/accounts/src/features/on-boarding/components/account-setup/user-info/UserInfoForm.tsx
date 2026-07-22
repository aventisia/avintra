import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { SelectField } from "@avplatform/ui/form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { countryProps } from "@/features/on-boarding/constants/company-form-field-props";
import { userInfoSchema } from "@/features/on-boarding/constants/user-info-zod-schema";
import { useDefineUserInfoForm } from "@/features/on-boarding/hooks/useDefineUserInfoForm";
import { useUpdateTenantInfoMutation } from "@/features/on-boarding/hooks/useUpdateTenantInfoMutation";
import { useCompanyInfoStore } from "@/features/on-boarding/stores/company-info-store";
import { useOnboardingStore } from "@/features/on-boarding/stores/on-boarding-store";
import { USER_NAME_LS_KEY } from "@/react-toolkit/constants";

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
        organizationName: "Individual Users",
        type: "Individual",
        ...formData,
      });
      localStorage.setItem("country", formData.country);

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
