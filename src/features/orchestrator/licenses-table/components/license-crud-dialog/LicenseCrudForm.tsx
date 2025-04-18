import { z } from "zod";

import { useFetchLicenseDetails, useFetchLicensesToSelect } from "@/hooks/useFetchLicense";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { Skeleton } from "@/react-toolkit/ui/skeleton";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { licenseOptimisticMutationFn } from "../../apis/licenses-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { additionalUnitsRequestedProps, idProps } from "../../constants/license-form-field-props";
import { licenseZodSchema } from "../../constants/license-zod-schema";
import { MyLicensesTableDto } from "../../dtos/licenses-table-dto";
import { useDefineLicenseForm } from "../../hooks/useDefineLicenseForm";
import { OverviewDetails } from "./OverviewDetails";

export const LicenseCrudForm = () => {
  // fetch licenses for the tenant
  const { data: lisencesToSelectResponse } = useFetchLicensesToSelect();

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

  const [planId] = watch(["planId", "additionalUnitsRequested"]);

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
      {/* License Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* license type */}
      {form.getValues("planId") || crudAction === "create" ? (
        <SelectField
          name="planId"
          label="License Type"
          isRequired={true}
          selectOptions={lisencesToSelectResponse?.data ?? []}
        />
      ) : null}

      {/* overview dtetails */}
      <OverviewDetails
        licenseDetails={licenseDetails?.data}
        isFetching={isFetching}
        planId={planId}
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
