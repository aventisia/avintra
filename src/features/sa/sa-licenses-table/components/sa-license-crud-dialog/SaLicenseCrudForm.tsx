import { z } from "zod";

import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { saLicenseOptimisticMutationFn } from "../../apis/sa-licenses-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  idProps,
  additionalUnitsRequestedProps,
  saLicenseTypesProps,
} from "../../constants/saLicense-form-field-props";
import { saLicenseZodSchema } from "../../constants/saLicense-zod-schema";
import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";
import { useDefineSaLicenseForm } from "../../hooks/useDefineSaLicenseForm";
import { OverviewDetails } from "./OverviewDetails";
import { LicenseSelectField } from "@/react-toolkit/ui/form/fields/LicenseSelectField";

export const SaLicenseCrudForm = () => {
  // Define license form
  const {
    form,
    currentLicenseData,
    watch,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  } = useDefineSaLicenseForm();

  // Define optimistic mutation to crete or update the license
  const { mutate: mutateLicense } = useListOptimisticMutation<
    LicensesTableDto,
    LicensesTableDto | boolean,
    LicensesTableDto
  >([rowId], saLicenseOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof saLicenseZodSchema>) => {
    // Create or update the license
    mutateLicense({
      payload: refineFormData(formData) as unknown as LicensesTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  const [planId] = watch(["planId"]);

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
        <LicenseSelectField {...saLicenseTypesProps} />
      ) : null}

      {/* overview dtetails */}
      {planId ? <OverviewDetails planId={planId} /> : null}

      {/* new quantity */}
      <div className="rounded-md bg-slate-100 p-5">
        <p className="text-md mb-2 pb-2">New Quantity</p>
        <InputField {...additionalUnitsRequestedProps} />
      </div>
      <div className="flex flex-row justify-between rounded-sm bg-primary-50 p-[.6rem] px-3">
        <p className="font-light">Additional Payment Due:</p>
        <p>{currentLicenseData?.overdueBalance ?? 0}</p>
      </div>

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
        <div className="!mt-10 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            Submit Request
          </Button>
        </div>
      )}
    </Form>
  );
};
