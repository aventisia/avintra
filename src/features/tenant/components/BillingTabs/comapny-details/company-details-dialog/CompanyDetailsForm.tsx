import {
  address1Props,
  address2Props,
  billingEmailProps,
  cityProps,
  companyNameProps,
  countryProps,
  gstNumberProps,
  pinCodeProps,
  stateProps,
} from "@/features/tenant/constants/company-details-field-props";
import { companyDetailsZodSchema } from "@/features/tenant/constants/company-details-zod-schema";
import { useCompanyDetailsForm } from "@/features/tenant/hooks/useCompanyDetailsForm";
import { useCompanyDetailsDialogStore } from "@/features/tenant/store/company-details/company-details-dialog-store";
import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form, InputField, SelectField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

const CompanyDetailsForm = () => {
  const { form, isSubmitting, isDirty } = useCompanyDetailsForm();
  const { setOpen } = useCompanyDetailsDialogStore();

  function submitHandler(formData: z.infer<typeof companyDetailsZodSchema>) {
    console.log(formData);
    setOpen(false);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <FormProvider {...form}>
        <ScrollArea className="h-[calc(100vh-16.5rem)]">
          <div className="space-y-4 p-6">
            <p className="font-medium">Company Details</p>
            <InputField {...companyNameProps} autoFocus />
            <InputField {...billingEmailProps} />

            <p className="font-medium">Business Address Details</p>
            <InputField {...address1Props} />
            <InputField {...address2Props} />
            <div className="grid grid-cols-2 items-center gap-4">
              <InputField {...cityProps} />
              <InputField {...pinCodeProps} />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <InputField {...stateProps} />
              <SelectField {...countryProps} />
            </div>

            <p className="font-medium">Business Tax ID</p>
            <InputField {...gstNumberProps} />
          </div>
        </ScrollArea>
      </FormProvider>

      <Separator className="!mt-0.5" />
      <div className="flex items-center justify-end px-6 pb-4">
        <Button
          size="xs"
          type="submit"
          // disabled={isSubmitting || isPending}
          disabled={isSubmitting || !isDirty}
          className="w-16"
        >
          {/* {isSubmitting || isPublishTemplatePending ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            "Save"
          )} */}
          Save
        </Button>
      </div>
    </Form>
  );
};

export default CompanyDetailsForm;
