import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import {
  addressLine1Props,
  addressLine2Props,
  billingEmailProps,
  cityProps,
  contactPersonProps,
  countryProps,
  gstNumberProps,
  isWillingToFileGstProps,
  organizationNameProps,
  postalCodeProps,
  stateProps,
} from "@/features/05-tenant-admin/tenant/constants/company-details-field-props";
import { companyDetailsZodSchema } from "@/features/05-tenant-admin/tenant/constants/company-details-zod-schema";
import { useCompanyDetailsForm } from "@/features/05-tenant-admin/tenant/hooks/useCompanyDetailsForm";

const CompanyDetailsForm = () => {
  const { form, isSubmitting, isDirty, mutate, isPending } = useCompanyDetailsForm();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = userSession?.tenantName == userSession?.email;

  function submitHandler(formData: z.infer<typeof companyDetailsZodSchema>) {
    mutate({
      organizationName: formData.organizationName,
      addressLine1: formData.addressLine1,
      city: formData.city,
      country: formData.country,
      isWillingToFileGst: !!formData.isWillingToFileGst,
      postalCode: formData.postalCode,
      state: formData.state,
      addressLine2: formData.addressLine2,
      billingEmail: formData.billingEmail,
      contactPerson: formData.contactPerson,
      id: formData.id,
      gstNumber: formData.gstNumber,
    });
  }

  const isGSTRegistered = form.watch("isWillingToFileGst");

  const applyGST = form.watch("country") == "India";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting || isPending}
    >
      <ScrollArea className="h-[calc(100vh-16.5rem)]">
        <div className="space-y-4 p-6">
          {!isIndividualUser && <InputField {...organizationNameProps} disabled />}{" "}
          <InputField autoFocus {...billingEmailProps} />
          <InputField {...contactPersonProps} />
          <InputField {...addressLine1Props} />
          <InputField {...addressLine2Props} />
          <div className="grid grid-cols-2 items-center gap-4">
            <InputField {...cityProps} />
            <InputField {...postalCodeProps} />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <InputField {...stateProps} />
            <SelectField {...countryProps} disabled />
          </div>
          {applyGST && <SwitchField {...isWillingToFileGstProps} />}
          {/* Additional validation field */}
          {applyGST && isGSTRegistered && <InputField {...gstNumberProps} />}
        </div>
      </ScrollArea>

      <Separator className="!mt-0.5" />
      <div className="flex items-center justify-end px-6 pb-4">
        <Button type="submit" disabled={isSubmitting || !isDirty || isPending}>
          {isSubmitting || isPending ? (
            <>
              {" "}
              <LoadingSpinner className="mr-1 h-4 w-4" /> Saving
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CompanyDetailsForm;
