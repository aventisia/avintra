import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  DatePickerField,
  Form,
  MultiSelectField,
  SelectField,
} from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import {
  agentsProps,
  aiModelsProps,
  endDateProps,
  serviceTypeProps,
  startDateProps,
  usersProps,
} from "../../constants/export-chart-field-props";
import { exportChartZodSchema } from "../../constants/export-chart-zod-schema";
import { useExportChartForm } from "../../hooks/useExportChartForm";
import { useExportDialogStore } from "../../store/export-dialog-store";

const ExportDialogForm = () => {
  const { setOpen } = useExportDialogStore();
  const { form, isSubmitting, isDirty } = useExportChartForm();

  async function submitHandler(formData: z.infer<typeof exportChartZodSchema>) {
    // await publishModelTemplate(formData);
    console.log(formData);
    setOpen(false);
  }
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <FormProvider {...form}>
        <ScrollArea className="h-[calc(100vh-26.5rem)]">
          <div className="space-y-4 px-5 py-4">
            <SelectField {...serviceTypeProps} />
            <Separator />
            <MultiSelectField {...usersProps} />
            <MultiSelectField {...agentsProps} />
            <MultiSelectField {...aiModelsProps} />
            <div className="grid grid-cols-2 gap-4">
              <DatePickerField {...startDateProps} />
              <DatePickerField {...endDateProps} />
            </div>
          </div>
        </ScrollArea>
      </FormProvider>

      <Separator className="!mt-0.5" />
      <div className="flex items-center justify-end px-6 pb-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-28"
        >
          {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : "Download"}
        </Button>
      </div>
    </Form>
  );
};

export default ExportDialogForm;
