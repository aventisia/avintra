import {
  documentTitleProps,
  documentTypeProps,
  guidelinesProps,
  localizationNeededProps,
  outputStructureProps,
} from "@/features/generative-model/constants/generative-model-field-props.ts/document-drafting-field-props";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";

import { Separator } from "@aventisia/ui";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";

type FormSchema = z.infer<typeof generativeModelInputZodSchema>;

type DocmentDraftingProps = {
  form: UseFormReturn<FormSchema>;
};

const DocmentDrafting = ({ form }: DocmentDraftingProps) => {
  return (
    <div className="space-y-4">
      <AutosizeTextareaField {...documentTitleProps} />
      <AutosizeTextareaField {...documentTypeProps} />
      <AutosizeTextareaField {...guidelinesProps} />
      <AutosizeTextareaField {...outputStructureProps} />
      <AutosizeTextareaField {...localizationNeededProps} />

      <Separator />
      <LLMConfiguration form={form} taskType="documentDrafting" />
    </div>
  );
};

export default DocmentDrafting;
