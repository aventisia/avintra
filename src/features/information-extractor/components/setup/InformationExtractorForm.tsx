import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";
import {
  documentContextProps,
  nodePropmptProps,
} from "../../constants/info-extractor-form-field-props";
import { InformationExtractorSetupDTO } from "../../dtos/info-extractor-setup-dto";
import { useAddInformationExtractorForm } from "../../hooks/useAddInfoExtractorForm";
import ContextTables from "./ContextTable";
import DataToBeExtracted from "./DataToBeExtracted";
import ModelConfiguration from "./ModelConfiguration";

const InformationExtractorForm = () => {
  const {
    form,
    isSubmitting,
    isUpdatePending,
    dataFields,
    addDataToExtracted,
    removeDataToExtracted,
    tableFields,
    addTableHandler,
    removeTableHandler,
    addTableHeaderHandler,
    removeTableHeaderHandler,
    updateFormData,
  } = useAddInformationExtractorForm();
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );
  const { data: modelData, isLoading } = useFetchModel();

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof addInfoExtractorFormZodSchema>,
  ) {
    updateFormData({
      setupObject: formData,
      id: modelId,
    } as InformationExtractorSetupDTO);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting || isLoading || modelData?.data.isPublished}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1 w-full">
            {/* Context */}
            <AutosizeTextareaField {...documentContextProps} />

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

            {/* Model Configuration */}
            <ModelConfiguration form={form} />

            {/* Prompt */}
            <AutosizeTextareaField {...nodePropmptProps} />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end gap-2 px-4 py-1 pb-4">
        <Button
          size="xs"
          type="submit"
          disabled={isSubmitting || isUpdatePending}
          className="w-16"
        >
          {isSubmitting || isUpdatePending ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default InformationExtractorForm;
