import {
  categoryDomainProps,
  personaNameProps,
  roleObjectiveProps,
} from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";

import { AutosizeTextareaField } from "@aventisia/ui/form";

const BasicInformation = () => {
  return (
    <div className="space-y-4">
      <p className="text-base">Basic Information</p>
      <AutosizeTextareaField {...personaNameProps} />
      <AutosizeTextareaField {...roleObjectiveProps} />
      <AutosizeTextareaField {...categoryDomainProps} />
    </div>
  );
};

export default BasicInformation;
