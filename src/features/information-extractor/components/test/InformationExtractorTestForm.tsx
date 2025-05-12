import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { infoExtractorTestFormZodSchema } from "../../constants/info-extractor-test-zod-schema";
import { useAddInformationExtractorTestForm } from "../../hooks/useAddInfoExtractorTestForm";
import DataFields from "./fields";
import ExtractedTablesData from "./tables";

const InformationExtractorTestForm = () => {
  const {
    form,
    dataFields,
    tableFields,
    refineFormData,
    handleAddRow,
    handleDeleteRow,
  } = useAddInformationExtractorTestForm();
  const {
    formState: { isSubmitting, isDirty },
    // getValues,
  } = form;

  // console.log(getValues());
  // Submit handler
  function submitHandler(
    formData: z.infer<typeof infoExtractorTestFormZodSchema>,
  ) {
    refineFormData(formData);
    console.log(formData);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow">
        <FormProvider {...form}>
          <div className="space-y-10 px-4 pb-1">
            <DataFields form={form} dataFields={dataFields} />
            <ExtractedTablesData
              form={form}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              tableFields={tableFields}
            />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator />
      <div className="flex items-center justify-end gap-2 px-4 py-1 pb-4">
        <Button size="xs" type="submit" disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default InformationExtractorTestForm;
