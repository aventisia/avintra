import {
  Form,
  InputField,
  SelectField,
  SwitchField,
  crudDialogFieldClasses,
} from "@avplatform/ui/form";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { createPortal } from "react-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
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
} from "@/features/05-tenant-admin/tenant/constants/company-details-field-props.ee";
import { companyDetailsZodSchema } from "@/features/05-tenant-admin/tenant/constants/company-details-zod-schema.ee";
import { useCompanyDetailsForm } from "@/features/05-tenant-admin/tenant/hooks/useCompanyDetailsForm.ee";

const CompanyDetailsForm = ({ actionsSlot }: { actionsSlot: HTMLElement | null }) => {
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

  const isSaving = isSubmitting || isPending;
  const inputClassName = crudDialogFieldClasses.input;

  return (
    <Form methods={form} onSubmit={form.handleSubmit(submitHandler)} disabled={isSaving}>
      {!isIndividualUser && (
        <InputField {...organizationNameProps} className={inputClassName} disabled />
      )}
      <InputField autoFocus {...billingEmailProps} className={inputClassName} />
      <InputField {...contactPersonProps} className={inputClassName} />
      <InputField {...addressLine1Props} className={inputClassName} />
      <InputField {...addressLine2Props} className={inputClassName} />
      <div className="grid grid-cols-2 items-start gap-4">
        <InputField {...cityProps} className={inputClassName} />
        <InputField {...postalCodeProps} className={inputClassName} />
      </div>
      <div className="grid grid-cols-2 items-start gap-4">
        <InputField {...stateProps} className={inputClassName} />
        <SelectField {...countryProps} className={crudDialogFieldClasses.selectTrigger} disabled />
      </div>
      {applyGST && <SwitchField {...isWillingToFileGstProps} />}
      {applyGST && isGSTRegistered && <InputField {...gstNumberProps} className={inputClassName} />}

      {actionsSlot &&
        createPortal(
          <CardDialogButton
            variant="primary"
            disabled={!isDirty || isSaving}
            isBusy={isSaving}
            onClick={form.handleSubmit(submitHandler)}
          >
            {isSaving ? "Saving" : "Save changes"}
          </CardDialogButton>,
          actionsSlot,
        )}
    </Form>
  );
};

export default CompanyDetailsForm;
