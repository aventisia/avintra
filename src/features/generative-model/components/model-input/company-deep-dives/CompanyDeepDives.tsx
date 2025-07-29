import {
  companyNameProps,
  focusAreaProps,
  summaryDepthProps,
  webDataProps,
  websiteLinkProps,
} from "@/features/generative-model/constants/generative-model-field-props.ts/company-deep-dive-field-props";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";
import { SelectField } from "@/shared/select-field/SelectField";

import { Separator } from "@aventisia/ui";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import CompanyDeepDiveLinks from "./CompanyDeepDivesLinks";

type FormSchema = z.infer<typeof generativeModelInputZodSchema>;

type CompanyDeepDivesProps = {
  form: UseFormReturn<FormSchema>;
};

const CompanyDeepDives = ({ form }: CompanyDeepDivesProps) => {
  return (
    <div className="space-y-4">
      <AutosizeTextareaField {...companyNameProps} />
      <AutosizeTextareaField {...websiteLinkProps} />

      <SelectField {...focusAreaProps} />
      <SelectField {...webDataProps} />
      <Separator />

      <CompanyDeepDiveLinks form={form} />
      <Separator />
      <SelectField {...summaryDepthProps} />

      <Separator />
      <LLMConfiguration form={form} taskType="companyDeepDives" />
    </div>
  );
};

export default CompanyDeepDives;
