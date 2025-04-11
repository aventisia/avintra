import { z } from "zod";

import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { inoviceOptimisticMutationFn } from "../../apis/inovices-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  addressLine1Props,
  addressLine2Props,
  addressLine3Props,
  cityProps,
  countryProps,
  emailProps,
  idProps,
  isDisabledProps,
  nameProps,
  pinCodeProps,
  stateProps,
  taxIdProps,
} from "../../constants/billing-address-form-field-props";
import { billingAddressZodSchema } from "../../constants/billing-address-zod-schema";
import { InovicesTableDto } from "../../dtos/inovices-table-dto";
import { useDefineBillingAddressForm } from "../../hooks/useDefineBillingAddressForm";

export const BillingAddressCrudForm = () => {
  // Define billingplan form
  const {
    form,
    userSession,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  } = useDefineBillingAddressForm();

  // Define optimistic mutation to crete or update the billingplan
  const { mutate: mutateBillingPlan } = useListOptimisticMutation<
    InovicesTableDto,
    InovicesTableDto | boolean,
    InovicesTableDto
  >([rowId], inoviceOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof billingAddressZodSchema>) => {
    // Create or update the billingplan
    mutateBillingPlan({
      payload: refineFormData(formData) as unknown as InovicesTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  // Is form in read mode
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* BillingPlan Id */}
      {isReadMode && <InputField {...idProps} />}

      <p className="text-md mb-2 border-b-2 pb-2">Overview</p>
      <div className="!mb-9 ml-1 flex justify-between">
        <p>Company Name</p>
        <p className="w-6/12 text-pretty text-right text-base font-semibold">
          {userSession?.tenantName}
        </p>
      </div>

      {/* address line 1 */}
      <InputField {...nameProps} />

      {/* address line 1 */}
      <InputField {...emailProps} />

      {/* address line 1 */}
      <InputField {...addressLine1Props} />

      {/* address line 2 */}
      <InputField {...addressLine2Props} />

      {/* address line 3 */}
      <InputField {...addressLine3Props} />

      <div className="grid grid-cols-2 gap-4">
        {/* pin code */}
        <InputField {...pinCodeProps} />

        {/* city */}
        <InputField {...cityProps} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* state */}
        <InputField {...stateProps} />

        {/* country */}
        <SelectField {...countryProps} />
      </div>

      {/* tax id */}
      <InputField {...taxIdProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            {crudAction === "create" ? "Add" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
