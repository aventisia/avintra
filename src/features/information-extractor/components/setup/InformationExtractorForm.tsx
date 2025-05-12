import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { TextareaField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";
import {
  documentContextProps,
  nodePropmptProps,
} from "../../constants/info-extractor-form-field-props";
import { useAddInformationExtractorForm } from "../../hooks/useAddInfoExtractorForm";
import ContextTables from "./ContextTable";
import DataToBeExtracted from "./DataToBeExtracted";

const InformationExtractorForm = () => {
  const {
    form,
    isSubmitting,
    isDirty,
    dataFields,
    addDataToExtracted,
    removeDataToExtracted,
    tableFields,
    addTableHandler,
    removeTableHandler,
    addTableHeaderHandler,
    removeTableHeaderHandler,
  } = useAddInformationExtractorForm();

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof addInfoExtractorFormZodSchema>,
  ) {
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
          <div className="space-y-4 px-4 pb-1 w-full">
            {/* Document Context */}
            <TextareaField {...documentContextProps} />

            {/* Separator */}
            <Separator />

            {/* Data to be extracted */}
            <DataToBeExtracted
              addDataToExtracted={addDataToExtracted}
              dataFields={dataFields}
              form={form}
              removeDataToExtracted={removeDataToExtracted}
            />

            {/* Separator */}
            {tableFields && tableFields.length > 0 && <Separator />}

            {/* Context Table */}
            <ContextTables
              addTableHandler={addTableHandler}
              addTableHeaderHandler={addTableHeaderHandler}
              removeTableHeaderHandler={removeTableHeaderHandler}
              form={form}
              removeTableHandler={removeTableHandler}
              tableFields={tableFields}
            />

            {tableFields && tableFields.length > 0 && <Separator />}

            {/* Node Prompt */}
            <TextareaField {...nodePropmptProps} />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end gap-2 px-4 py-1 pb-4">
        <Button size="xs" type="submit" disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default InformationExtractorForm;
