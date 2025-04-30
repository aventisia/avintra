import { useFetchPricingPlanDetails } from "@/features/sa/pricing-table/hooks/useFetchPricingPlanDetails";
import { Skeleton } from "@aventisia/ui";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { InputField } from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect, useState } from "react";
import { z } from "zod";

import { licenseOptimisticMutationFn } from "../../apis/licenses-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  additionalUnitsRequestedProps,
  idProps,
  licenseSelectProps,
} from "../../constants/license-form-field-props";
import { licenseZodSchema } from "../../constants/license-zod-schema";
import { MyLicensesTableDto } from "../../dtos/licenses-table-dto";
import { useDefineLicenseForm } from "../../hooks/useDefineLicenseForm";
import { OverviewDetails } from "./OverviewDetails";

export const LicenseCrudForm = () => {
  // Define license form
  const {
    form,
    watch,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  } = useDefineLicenseForm();

  // Define optimistic mutation to crete or update the license
  const { mutate: mutateLicense } = useListOptimisticMutation<
    MyLicensesTableDto,
    MyLicensesTableDto | boolean,
    MyLicensesTableDto
  >([rowId], licenseOptimisticMutationFn, DATA_QUERY_KEY);

  const [additionalPaymentDue, setAdditionalPaymentDue] = useState(0);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof licenseZodSchema>) => {
    // Create or update the license
    mutateLicense({
      payload: refineFormData(formData) as unknown as MyLicensesTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  const [planId, additionalUnitsRequested] = watch([
    "planId",
    "additionalUnitsRequested",
  ]);

  const { data: planDetails, isFetching } = useFetchPricingPlanDetails(planId);

  useEffect(() => {
    setAdditionalPaymentDue(
      (additionalUnitsRequested ?? 0) *
        (planDetails?.data?.pricingComponent == "GPUCompute" ? 1 : 12) *
        (planDetails?.data?.unitPrice ?? 0),
    );
  }, [
    additionalUnitsRequested,
    planDetails?.data?.pricingComponent,
    planDetails?.data?.unitPrice,
  ]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* License Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* license type */}
      <AsyncSelectField {...licenseSelectProps} />

      {/* overview dtetails */}
      <OverviewDetails
        licenseDetails={planDetails?.data}
        isFetching={isFetching}
        planId={planId}
      />

      {/* new quantity */}
      <div className="rounded-lg bg-slate-100 p-5">
        <p className="text-md mb-2 pb-2">New Quantity</p>
        <InputField {...additionalUnitsRequestedProps} />
      </div>
      <div className="flex flex-row justify-between rounded-lg bg-primary-50 p-[.6rem] px-3">
        <p className="font-light">Additional Payment Due:</p>
        <div>
          {isFetching ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            currencyFormater(additionalPaymentDue, planDetails?.data.currency)
          )}
        </div>
      </div>

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isFetching}
            className="min-w-[5rem]"
          >
            Submit Request
          </Button>
        </div>
      )}
    </Form>
  );
};
