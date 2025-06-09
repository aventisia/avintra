import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { ModelNamesEnum } from "@/features/pdf-previewer/enums/model-name-enum";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { DateTimePickerField } from "@/shared/date-time-picker/DateTimePickerField";

import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { scheduleFineTune } from "../../apis/fine-tune-table-apis";
import { HISTORY_TABLE_QUERY_KEY } from "../../constants";
import { timeZoneProps } from "../../constants/schedule-fine-tune-field-props";
import { scheduleFineTuneFormZodSchema } from "../../constants/schedule-fine-tune-zod-schema";
import { ScheduleFineTuneDTO } from "../../dtos/schedule-fine-tune-dto";
import { useScheduleFineTuneForm } from "../../hooks/useScheduleFineTuneForm";

const HistoryCrudForm = () => {
  const { form, refineFormData, setShowDialog } = useScheduleFineTuneForm();

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const { data: modelData } = useFetchModel();
  const modelName =
    ModelNamesEnum[modelData!.data.type as keyof typeof ModelNamesEnum];

  const queryClient = useQueryClient();

  const { mutate: mutateRecords } = useMutation({
    mutationFn: (formData: ScheduleFineTuneDTO) =>
      scheduleFineTune(formData, modelName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_TABLE_QUERY_KEY });
      toast.success("Fine Tuning Scheduled");
      setShowDialog(false);
    },
    onError: () => {
      toast.error("Error scheduling records, please try again.");
    },
  });

  async function submitHandler(
    formData: z.infer<typeof scheduleFineTuneFormZodSchema>,
  ) {
    mutateRecords(refineFormData(formData));
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="h-[calc(100vh-9rem)] px-2.5 pb-0 pt-4">
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1">
            <AsyncSelectField {...timeZoneProps} />
            <DateTimePickerField
              name="scheduledAt"
              label="Schedule on"
              placeholder="Pick a date & time"
            />
          </div>
        </FormProvider>
      </ScrollArea>

      {/* Sticky footer button */}
      <div className="flex w-full  justify-end px-2 pb-4 border-t pt-3 mt-auto bg-white">
        <Button
          size="xs"
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-w-[5rem]"
        >
          {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : "Save"}
        </Button>
      </div>
    </Form>
  );
};

export default HistoryCrudForm;
