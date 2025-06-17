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
      <div className="grid md:grid-cols-3 gap-4 items-center">
        <AutosizeTextareaField {...personaNameProps} />
        <AutosizeTextareaField {...roleObjectiveProps} />
        <AutosizeTextareaField {...categoryDomainProps} />
      </div>
    </div>
  );
};

export default BasicInformation;
