import {
  exclusionsBoundariesProps,
  instructionsProps,
  toneOfVoiceProps,
} from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";
import { SelectField } from "@/shared/select-field/SelectField";

import { AutosizeTextareaField } from "@aventisia/ui/form";

const PersonaBehavior = () => {
  return (
    <div className="space-y-4">
      <p className="text-base">Persona Behaviour</p>
      <SelectField {...toneOfVoiceProps} />
      <AutosizeTextareaField {...instructionsProps} />
      <AutosizeTextareaField {...exclusionsBoundariesProps} />
    </div>
  );
};

export default PersonaBehavior;
