import {
  companyNameProps,
  desiredOutputsProps,
  personaNameProps,
  purposeOfResearchProps,
} from "@/features/generative-model/constants/generative-model-field-props/persona-research-field-props";
import { personaResearchZodSchema } from "@/features/generative-model/constants/generative-model-zod-schemas/persona-research-zod-schema";
import { usePersonaResearchForm } from "@/features/generative-model/hooks/usePersonaResearchForm";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { SelectField } from "@/shared/select-field/SelectField";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import GenerativeInputLinks from "../generative-input-links/GenerativeInputLinks";

const PersonaResearchForm = () => {
  const { form, isSubmitting, refineFormData } = usePersonaResearchForm();
  const { data: modelData, isLoading } = useFetchModel();

  function submitHandler(formData: z.infer<typeof personaResearchZodSchema>) {
    console.log(refineFormData(formData));
  }
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting || isLoading || modelData?.data.isPublished}
    >
      <FormProvider {...form}>
        <div className="space-y-4 px-4 pb-1 w-full">
          <AutosizeTextareaField {...personaNameProps} />
          <AutosizeTextareaField {...companyNameProps} />
          <Separator />

          <GenerativeInputLinks form={form} name="referenceURLs" />
          <Separator />

          <SelectField {...purposeOfResearchProps} />
          <SelectField {...desiredOutputsProps} />

          <Separator />
          <LLMConfiguration form={form} />
        </div>
      </FormProvider>

      <div className="sticky bottom-0 bg-white">
        <Separator className="h-[0.5px] w-full" />
        <div className="flex items-center justify-end self-end gap-2 px-4 py-3.5">
          <Button size="xs" type="submit" disabled={isSubmitting}>
            {/* {isSubmitting || isUpdatePending ? (
                    <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      "Save"
                      )} */}
            Save & Execute
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default PersonaResearchForm;
