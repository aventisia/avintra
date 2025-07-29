import {
  dataAndStatsProps,
  documentTypeProps,
  industryProps,
  outputLengthProps,
  outputStructureProps,
  purposeOfArticleProps,
  targetAudienceProps,
  toneAndStyleProps,
  topicProps,
} from "@/features/generative-model-new/constants/generative-model-field-props/thought-leadership-field-props";
import { thoughtLeadershipZodSchema } from "@/features/generative-model-new/constants/generative-model-zod-schemas/thought-leadership-dto";
import { useThoughtLeadershipForm } from "@/features/generative-model-new/hooks/useThoughtLeadershipForm";
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

const ThoughtLeadershipForm = () => {
  const { form, isSubmitting } = useThoughtLeadershipForm();
  const { data: modelData, isLoading } = useFetchModel();

  function submitHandler(formData: z.infer<typeof thoughtLeadershipZodSchema>) {
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
            <SelectField {...documentTypeProps} />
            <AutosizeTextareaField {...topicProps} />
            <AutosizeTextareaField {...industryProps} />
            <div className="grid grid-cols-2 gap-2 items-center ">
              <SelectField {...purposeOfArticleProps} />
              <SelectField {...toneAndStyleProps} />
            </div>
            <AutosizeTextareaField {...targetAudienceProps} />
            <SelectField {...dataAndStatsProps} />
            <Separator />

            {/* Link */}
            <GenerativeInputLinks form={form} />
            <Separator />
            {/* Documents */}

            <AutosizeTextareaField {...outputLengthProps} />
            <AutosizeTextareaField {...outputStructureProps} />

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

export default ThoughtLeadershipForm;
