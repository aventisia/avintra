import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { LicenseSelectField } from "@/react-toolkit/ui/form/fields/LicenseSelectField";
import { TenantSelectField } from "@/react-toolkit/ui/form/fields/TenantSelectField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { useMutation } from "@tanstack/react-query";

import { requestLicense } from "../../apis/sa-licenses-table-apis";
import {
  additionalUnitsRequestedProps,
  idProps,
  saLicenseTypesProps,
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

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof requestLicenseZodSchema>) => {
    // Create or update the license
    mutateLicense(refineFormData(formData) as unknown as RequestLicensesDto);

    // Close the dialog
    setShowDialog(false);
  };

  const [planId, id] = watch(["planId", "id"]);

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
        <TenantSelectField {...idProps} />
      ) : null}

      {/* license type */}
      {form.getValues("planId") || crudAction === "create" ? (
        <LicenseSelectField {...saLicenseTypesProps} />
      ) : null}

      {/* overview dtetails */}
      {planId && id ? (
        <RequestLicenseOverviewDetails planId={planId} tenantId={id} />
      ) : null}

      {/* new quantity */}
      <div className="rounded-md bg-slate-100 p-5">
        <p className="text-md mb-2 pb-2">New Quantity</p>
        <InputField {...additionalUnitsRequestedProps} />
      </div>
      <div className="flex flex-row justify-between rounded-sm bg-primary-50 p-[.6rem] px-3">
        <p className="font-light">Additional Payment Due:</p>
        <p>{0}</p>
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
