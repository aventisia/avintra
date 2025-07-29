import {
  companyNameProps,
  focusAreaProps,
  summaryDepthProps,
  webDataProps,
  websiteLinkProps,
} from "@/features/generative-model-new/constants/generative-model-field-props/company-deep-dives-field-props";
import { companyDeepDivesZodSchema } from "@/features/generative-model-new/constants/generative-model-zod-schemas/company-deep-dives-zod-schema";
import { useCompanyDeepDivesForm } from "@/features/generative-model-new/hooks/useCompanyDeepDivesForm";
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { SelectField } from "@/shared/select-field/SelectField";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import GenerativeInputLinks from "../generative-input-links/GenerativeInputLinks";

const CompanyDeepDivesForm = () => {
  const { form, isSubmitting } = useCompanyDeepDivesForm();
  const { data: modelData, isLoading } = useFetchModel();

  function submitHandler(formData: z.infer<typeof companyDeepDivesZodSchema>) {
    console.log(formData);
  }
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting || isLoading || modelData?.data.isPublished}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-18.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1 w-full">
            <AutosizeTextareaField {...companyNameProps} />
            <AutosizeTextareaField {...websiteLinkProps} />

            <SelectField {...focusAreaProps} />
            <SelectField {...webDataProps} />
            <Separator />

            <GenerativeInputLinks form={form} />
            <Separator />
            <SelectField {...summaryDepthProps} />

            <Separator />
            <LLMConfiguration form={form} />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end self-end gap-2 px-4 py-1 pb-4">
        <Button size="xs" type="submit" disabled={isSubmitting}>
          {/* {isSubmitting || isUpdatePending ? (
                        <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          "Save"
                          )} */}
          Save & Execute
        </Button>
      </div>
    </Form>
  );
};

export default CompanyDeepDivesForm;
