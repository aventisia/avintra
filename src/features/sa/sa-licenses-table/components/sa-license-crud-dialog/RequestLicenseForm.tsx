import { toast } from "sonner";
import { z } from "zod";

import { useFetchLicenseDetails, useFetchLicensesToSelect } from "@/hooks/useFetchLicense";
import { useFetchTenantsToSelect } from "@/hooks/useFetchTenantsToSelect";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { Skeleton } from "@/react-toolkit/ui/skeleton";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";
import { useMutation } from "@tanstack/react-query";

import { requestLicense } from "../../apis/sa-licenses-table-apis";
import { additionalUnitsRequestedProps } from "../../constants/saLicense-form-field-props";
import { requestLicenseZodSchema } from "../../constants/saLicense-zod-schema";
import { RequestLicensesDto } from "../../dtos/request-license-dto";
import { useDefineRequestLicenseForm } from "../../hooks/useDefineRequestLicenseForm";
import { RequestLicenseOverviewDetails } from "./RequestLicenseOverviewDetails";

export const RequestLicenseForm = () => {
  const { data: lisencesToselectResponse } = useFetchLicensesToSelect();
  const { selectOptions: tenantsToselect } = useFetchTenantsToSelect(true);

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

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof requestLicenseZodSchema>) => {
    // Create or update the license
    mutateLicense(refineFormData(formData) as unknown as RequestLicensesDto);

    // Close the dialog
    setShowDialog(false);
  };

  const [planId, id] = watch(["planId", "id"]);

  const { data: licenseDetails, isFetching } = useFetchLicenseDetails(planId);

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
      {form.getValues("id") || crudAction === "create" ? (
        <SelectField
          name="id"
          label="Tenant Name"
          isRequired={true}
          selectOptions={tenantsToselect ?? []}
        />
      ) : null}

      {/* license type */}
      {form.getValues("planId") || crudAction === "create" ? (
        <SelectField
          name="planId"
          label="License Type"
          isRequired={true}
          selectOptions={lisencesToselectResponse?.data ?? []}
        />
      ) : null}

      <RequestLicenseOverviewDetails
        licenseDetails={licenseDetails?.data}
        isFetching={isFetching}
        planId={planId}
        tenantId={id}
      />

      {/* new quantity */}
      <div className="rounded-md bg-slate-100 p-5">
        <p className="text-md mb-2 pb-2">New Quantity</p>
        <InputField {...additionalUnitsRequestedProps} />
      </div>
      <div className="flex flex-row justify-between rounded-sm bg-primary-50 p-[.6rem] px-3">
        <p className="font-light">Additional Payment Due:</p>
        <div>
          {isFetching ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            currencyFormater(
              (form.getValues("additionalUnitsRequested") ?? 0) *
                12 *
                (licenseDetails?.data?.unitPrice ?? 0),
              licenseDetails?.data.currency,
            )
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
