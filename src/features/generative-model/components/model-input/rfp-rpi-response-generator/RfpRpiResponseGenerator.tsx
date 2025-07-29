import {
  clientLinkProps,
  clientNameProps,
  responseBoundariesProps,
  responseStrategyProps,
} from "@/features/generative-model/constants/generative-model-field-props.ts/rfp-rpi-response-generator-field-props";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";
import { SelectField } from "@/shared/select-field/SelectField";

import { Separator } from "@aventisia/ui";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import RfpRpiGeneratorLinks from "./RfpRpiLinks";

type FormSchema = z.infer<typeof generativeModelInputZodSchema>;

type RfpRpiResponseGeneratorProps = {
  form: UseFormReturn<FormSchema>;
};

const RfpRpiResponseGenerator = ({ form }: RfpRpiResponseGeneratorProps) => {
  return (
    <div className="space-y-4">
      <AutosizeTextareaField {...clientNameProps} />
      <AutosizeTextareaField {...clientLinkProps} />

      <Separator />
      <Separator />

      <SelectField {...responseStrategyProps} />
      <SelectField {...responseBoundariesProps} />

      <Separator />
      <RfpRpiGeneratorLinks form={form} />

      <Separator />
      <LLMConfiguration form={form} taskType="rfpRpiResponseGenerator" />
    </div>
  );
};

export default RfpRpiResponseGenerator;
