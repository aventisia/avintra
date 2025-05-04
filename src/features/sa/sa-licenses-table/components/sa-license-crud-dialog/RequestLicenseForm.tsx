import { Skeleton } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getPricingPlansToSelect } from "@/features/sa/pricing-table/apis/pricingPlans-table-apis";
import { useFetchPricingPlanDetails } from "@/features/sa/pricing-table/hooks/useFetchPricingPlanDetails";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { requestLicense } from "../../apis/sa-licenses-table-apis";
import {
  additionalUnitsRequestedProps,
  licenseSelectProps,
  tenantSelectProps,
} from "../../constants/saLicense-form-field-props";
import { requestLicenseZodSchema } from "../../constants/saLicense-zod-schema";
import { RequestLicensesDto } from "../../dtos/request-license-dto";
import { useDefineRequestLicenseForm } from "../../hooks/useDefineRequestLicenseForm";

import { RequestLicenseOverviewDetails } from "./RequestLicenseOverviewDetails";

export const RequestLicenseForm = () => {
  // Define license form
  const { form, watch, isDirty, crudAction, setShowDialog, refineFormData } =
    useDefineRequestLicenseForm();

  const { isPending, mutate: mutateLicense } = useMutation({
    mutationFn: requestLicense,
    onSuccess: (httpResponse) => {
      // Success message
      toast.success(httpResponse?.message, {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });

  const [additionalPaymentDue, setAdditionalPaymentDue] = useState(0);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof requestLicenseZodSchema>) => {
    // Create or update the license
    mutateLicense(refineFormData(formData) as unknown as RequestLicensesDto);

    // Close the dialog
    setShowDialog(false);
  };

  const [planId, id, additionalUnitsRequested] = watch([
    "planId",
    "id",
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
      {/* tenant name id */}
      <AsyncSelectField {...tenantSelectProps} />

      {/* license type */}
      <AsyncSelectField
        {...licenseSelectProps}
        disabled={!id}
        selectOptions={() =>
          !id
            ? Promise.resolve([])
            : getPricingPlansToSelect(id).then((data) => data.data)
        }
      />

      <RequestLicenseOverviewDetails
        licenseDetails={planDetails?.data}
        isFetching={isFetching}
        planId={planId}
        tenantId={id}
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
            disabled={!isDirty || isPending}
            className="min-w-[5rem]"
          >
            Submit Request
          </Button>
        </div>
      )}
    </Form>
  );
};
