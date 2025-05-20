import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  CheckboxField,
  DatePickerField,
  Form,
  InputField,
} from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { Tooltip } from "@aventisia/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";

import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { recordPaymnet } from "../../apis/sa-licenses-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  amountReceivedProps,
  dateReceivedProps,
} from "../../constants/saLicense-form-field-props";
import { recordPaymentZodSchema } from "../../constants/saLicense-zod-schema";
import { RecordPaymentDto } from "../../dtos/record-payment-dto";
import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";
import { useDefineRecordPaymentForm } from "../../hooks/useDefineRecordPaymentForm";

import { RecordPaymentOverviewDetails } from "./RecordPaymentOverviewDetails";

export const RecordPaymentForm = () => {
  // Get query client
  const queryClient = useQueryClient();
  // Define license form
  const { form, isDirty, crudAction, setShowDialog, refineFormData } =
    useDefineRecordPaymentForm();

  const { isPending, mutate: mutateLicense } = useMutation({
    mutationFn: recordPaymnet,
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

  const [_varience, set_varience] = useState(0);

  const [amountReceived] = form.watch(["amountReceived"]);

  // Get licenses data from query client
  const licensesData = queryClient.getQueryData<{
    data: LicensesTableDto[];
  }>(DATA_QUERY_KEY);

  // Get license data by id
  const myLicenseData = licensesData?.data.find(
    (item) => item.planId === form.getValues("planId"),
  );

  useEffect(() => {
    set_varience(
      ((amountReceived - (myLicenseData?.overdueBalance ?? 0)) /
        (myLicenseData?.overdueBalance ?? 0)) *
        100,
    );
  }, [amountReceived, myLicenseData?.overdueBalance]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof recordPaymentZodSchema>) => {
    // Create or update the license
    mutateLicense(refineFormData(formData) as unknown as RecordPaymentDto);

    // Close the dialog
    setShowDialog(false);
  };

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
      {/* overview dtetails */}
      <RecordPaymentOverviewDetails details={myLicenseData} />

      {/* record paymnet */}
      <div className="!mt-4 space-y-2 rounded-md bg-slate-100 p-5">
        <p className="text-md mb-2 pb-2">Payment Details</p>
        <Separator className="my-2" />
        <DatePickerField {...dateReceivedProps} />
        <InputField {...amountReceivedProps} />

        <div className="ml-1 flex justify-between text-sm">
          <p className="font-light">Variance:</p>
          <p>{`${isNaN(_varience) ? 0 : _varience.toFixed(2)}%`}</p>
        </div>

        <div className="ml-1 flex justify-between text-sm">
          <p className="font-light">Balance Due:</p>
          <p>
            {currencyFormater(
              myLicenseData?.overdueBalance ?? 0,
              myLicenseData?.currency,
            )}
          </p>
        </div>

        <div className="ml-1 flex justify-between">
          <label
            htmlFor="writeOffRemainingDues"
            className="flex space-x-2 align-middle text-sm"
          >
            <p>Write of remaining due</p>
            <Tooltip content="write off all the due" className="text-sm">
              <InformationCircleIcon className="h-4 w-4" />
            </Tooltip>
          </label>
          <CheckboxField
            id="writeOffRemainingDues"
            name="writeOffRemainingDues"
            label=""
          />
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
            Record
          </Button>
        </div>
      )}
    </Form>
  );
};
