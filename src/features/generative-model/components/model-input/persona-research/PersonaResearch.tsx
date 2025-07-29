import {
  companyNameProps,
  desiredOutputsProps,
  personaNameProps,
  purposeOfResearchProps,
} from "@/features/generative-model/constants/generative-model-field-props.ts/persona-research-field-props";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";
import { SelectField } from "@/shared/select-field/SelectField";

import { Separator } from "@aventisia/ui";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import PersonaResearchLinks from "./PersonaResearchLinks";

type FormSchema = z.infer<typeof generativeModelInputZodSchema>;

type PersonaResearchProps = {
  form: UseFormReturn<FormSchema>;
};

const PersonaResearch = ({ form }: PersonaResearchProps) => {
  return (
    <div className="space-y-4">
      <AutosizeTextareaField {...personaNameProps} />
      <AutosizeTextareaField {...companyNameProps} />
      <Separator />

      <PersonaResearchLinks form={form} />
      <Separator />

      <SelectField {...purposeOfResearchProps} />
      <SelectField {...desiredOutputsProps} />

      <Separator />
      <LLMConfiguration form={form} taskType="personaResearch" />
    </div>
  );
};

export default PersonaResearch;
