import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/react-toolkit/ui/buttons/Button";
import { CheckboxField } from "@/react-toolkit/ui/form/fields/CheckboxField";
import { DatePickerField } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { Separator } from "@/react-toolkit/ui/separator";
import { Tooltip } from "@/react-toolkit/ui/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";

import { recordPaymnet } from "../../apis/sa-licenses-table-apis";
import {
  amountReceivedProps,
  dateReceivedProps,
} from "../../constants/saLicense-form-field-props";
import { recordPaymentZodSchema } from "../../constants/saLicense-zod-schema";
import { RecordPaymentDto } from "../../dtos/record-payment-dto";
import { useDefineRecordPaymentForm } from "../../hooks/useDefineRecordPaymentForm";
import { RecordPaymentOverviewDetails } from "./RecordPaymentOverviewDetails";

export const RecordPaymentForm = () => {
  // Define license form
  const { form, watch, isDirty, crudAction, setShowDialog, refineFormData } =
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

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof recordPaymentZodSchema>) => {
    // Create or update the license
    mutateLicense(refineFormData(formData) as unknown as RecordPaymentDto);

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
      {/* overview dtetails */}
      {planId ? <RecordPaymentOverviewDetails planId={planId} /> : null}

      {/* record paymnet */}
      <div className="!mt-4 space-y-2 rounded-md bg-slate-100 p-5">
        <p className="text-md mb-2 pb-2">Payment Details</p>
        <Separator className="my-2" />
        <DatePickerField {...dateReceivedProps} />
        <InputField {...amountReceivedProps} />

        <div className="ml-1 flex justify-between text-sm">
          <p className="font-light">Variance:</p>
          <p>{0}</p>
        </div>

        <div className="ml-1 flex justify-between text-sm">
          <p className="font-light">Balance Due:</p>
          <p>{0}</p>
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
