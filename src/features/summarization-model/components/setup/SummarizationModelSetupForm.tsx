import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form, InputField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { SelectField } from "../../../../shared/select-field/SelectField";
import {
  charactersPerChunkProps,
  chunkOverlapProps,
  contextProps,
  finalPromptToCombineProps,
  individualSummaryPromptProps,
  initialPromptProps,
  promptProps,
  subsequentPromptProps,
  summarizationMethodProps,
  totalMaxWordsProps,
  totalMinWordsProps,
} from "../../constants/summarization-model-setup-form-field-props";
import { summarizationModelSetupFormZodSchema } from "../../constants/summarization-model-setup-zod-schema";
import { SummarizationSetupDTO } from "../../dtos/summarization-setup-dto";
import { useSummarizationModelSetupForm } from "../../hooks/useSummarizationModelSetupForm";

const SummarizationModelSetupForm = () => {
  const {
    form,
    isSubmitting,
    isDirty,
    isUpdatePending,
    updateFormData,
    refineFormData,
  } = useSummarizationModelSetupForm();
  const { watch } = form;
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  const summarizationMethodValue = watch("summarizationMethod");

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof summarizationModelSetupFormZodSchema>,
  ) {
    updateFormData({
      setupObject: refineFormData(formData),
      id: modelId,
    } as SummarizationSetupDTO);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1 w-full">
            {/* Context */}
            <AutosizeTextareaField {...contextProps} />

            <div className="grid grid-cols-2 gap-2">
              {/* Character Per Chunk */}
              <InputField {...charactersPerChunkProps} />

              {/* Chunk Overlap (Characters) */}
              <InputField {...chunkOverlapProps} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Total Min Words */}
              <InputField {...totalMinWordsProps} />

              {/* Total Max Words */}
              <InputField {...totalMaxWordsProps} />
            </div>

            {/* Summarization Method */}
            <SelectField {...summarizationMethodProps} />

            {summarizationMethodValue === "MapReduce" && (
              <>
                {/* Individual Summary Prompt */}
                <AutosizeTextareaField {...individualSummaryPromptProps} />

                {/* Final Prompt to combine */}
                <AutosizeTextareaField {...finalPromptToCombineProps} />
              </>
            )}

            {summarizationMethodValue === "Refine" && (
              <>
                {/* Subsequent Refine Prompt */}
                <AutosizeTextareaField {...subsequentPromptProps} />

                {/* Initial Prompt */}
                <AutosizeTextareaField {...initialPromptProps} />
              </>
            )}

            {summarizationMethodValue === "Stuff" && (
              <>
                {/* Prompt */}
                <AutosizeTextareaField {...promptProps} />
              </>
            )}
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end self-end gap-2 px-4 py-1 pb-4">
        <Button
          size="xs"
          type="submit"
          disabled={!isDirty || isSubmitting || isUpdatePending}
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

export default SummarizationModelSetupForm;
